import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { Embeds } from 'discord-paginationembed';
import sequelize, { Op, Model } from 'sequelize';
import ntim from '../../util/name_to_id_map.json';
import config from '../../config.json';
import { stripIndents } from 'common-tags';
import { pokemon } from '../../rdmdbModels/pokemon';
import { pokestop } from '../../rdmdbModels/pokestop';
import { parsePokemonDb } from '../../util/parse';

export default class PokesearchCommand extends Command {
  public constructor() {
    super('pokesearch', {
      aliases: ['pokesearch'],
      category: 'Search',
      description: {
        content: 'Search for pokemon.',
        usage: stripIndents`pokesearch
        \`pokemon's name\`
        \`distance(km/m) lattitude,longitude\`
        \`city\`
        iv \`min iv\`
        cp \`min cp\`
        level \`min level\`
        (\`attack\`,\`defense\`,\`stamina\`)
        `,
        examples: ['pokesearch'],
      },
      ratelimit: 3,
      args: [
        {
          id: 'name',
          type: (_: Message, str: string): boolean | string => {
            if (Object.keys(ntim).includes(str.toLowerCase()))
              return str.toLowerCase();
            return false;
          },
          match: 'separate',
        },
        {
          id: 'city',
          type: (_: Message, str: string): boolean | string => {
            if (Object.keys(config.cities).includes(str.toLowerCase()))
              return str;
            return false;
          },
          match: 'separate',
        },
        {
          id: 'radius',
          type: (_: Message, str: string): boolean | Object => {
            if (str.endsWith('km') || str.endsWith('m')) {
              const num = parseFloat(
                str.split(str.endsWith('km') ? 'km' : 'm')[0]
              );
              return isNaN(num)
                ? null
                : {
                    radius: num / (str.endsWith('km') ? 1 : 1000),
                    unit: str.endsWith('km') ? 'km' : 'm',
                  };
            }
            return false;
          },
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid radius, which must end in either **km** or **m**.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid radius, which must end in either **km** or **m**.`,
          },
          match: 'separate',
        },
        {
          id: 'center',
          type: (_: Message, str: string): boolean | null | number[] => {
            if (str.split(',').length === 2) {
              const lat = parseFloat(str.split(',')[0]);
              const lon = parseFloat(str.split(',')[1]);
              if (isNaN(lat) || isNaN(lon)) return null;
              return [lat, lon];
            }
            return false;
          },
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid center point, which must consist of two points, a latitude and longitude. Example: **35.482501, 139.631672**.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid center point, which must consist of two points, a latitude and longitude. Example: **35.482501, 139.631672**.`,
          },
          match: 'separate',
        },
        {
          id: 'miniv',
          type: (_: Message, str: string): null | number => {
            const miniv = parseFloat(str);
            if (isNaN(miniv)) return null;
            if (miniv < 0 || miniv > 100) return null;
            else return miniv;
          },
          flag: ['iv'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid iv amount, which must be an integer between 0 and 100.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid iv amount, which must be an integer between 0 and 100.`,
          },

          match: 'option',
        },
        {
          id: 'mincp',
          type: (_: Message, str: string): null | number => {
            const mincp = Number(str);
            if (isNaN(mincp)) return null;
            if (mincp < 0 || mincp > 4000) return null;
            else return mincp;
          },
          flag: ['cp'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid cp amount, which must be an integer between 0 and 4000.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid cp amount, which must be an integer between 0 and 4000.`,
          },

          match: 'option',
        },
        {
          id: 'minlevel',
          type: (_: Message, str: string): null | number => {
            const minlevel = Number(str);
            if (isNaN(minlevel)) return null;
            if (minlevel < 0 || minlevel > 40) return null;
            else return minlevel;
          },
          flag: ['level'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid level amount, which must be an integer between 0 and 40.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid minlevel amount, which must be an integer between 0 and 40.`,
          },

          match: 'option',
        },
        {
          id: 'rawiv',
          type: (_: Message, str: string): boolean | null | {} => {
            let attack: number, defense: number, stamina: number;
            try {
              const splitArg = str.split('/');
              if (splitArg.length !== 3) return false;
              attack = parseInt(splitArg[0]);
              defense = parseInt(splitArg[1]);
              stamina = parseInt(splitArg[2]);
              if (isNaN(attack) || isNaN(defense) || isNaN(stamina))
                return null;
            } catch (e) {
              return false;
            }
            if (
              attack > 15 ||
              defense > 15 ||
              stamina > 15 ||
              attack < 0 ||
              defense < 0 ||
              stamina < 0
            )
              return null;
            return { attack: attack, defense: defense, stamina: stamina };
          },
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid rawiv value, which must be in the format (\`attack\`,\`defense\`,\`stamina\`) where attack, defense, and stamina are all between 0 and 15 (inclusive).`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid rawiv value, which must be in the format (\`attack\`,\`defense\`,\`stamina\`) where attack, defense, and stamina are all between 0 and 15 (inclusive).`,
          },
          match: 'separate',
        },
      ],
    });
  }

  public async exec(message: Message, args) {
    for (let arg in args) {
      if (args[arg] === null || args[arg] === false) delete args[arg];
      if (
        ['name', 'city', 'radius', 'rawiv', 'center'].includes(arg) &&
        args[arg] &&
        args[arg].length > 0
      )
        args[arg] = args[arg].find((a) => a !== false && a !== null);
    }
    if (args.name) args.pokemon_id = ntim[args.name.toLowerCase()];
    if (args.radius) {
      args.unit = args.radius.unit;
      args.radius = args.radius.radius;
    }
    // raw sql literal for distance between the latitude,longitude and a given pokemon's coordinates
    const distance = args.center
      ? sequelize.literal(
          `111.111 *
    DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${args.center[0]}))
         * COS(RADIANS(\`pokemon\`.\`lat\`))
         * COS(RADIANS(${args.center[1]} - \`pokemon\`.\`lon\`))
         + SIN(RADIANS(${args.center[0]}))
         * SIN(RADIANS(\`pokemon\`.\`lat\`)))))`
        )
      : null;

    // raw sql literal to check whether a given pokemon's coordinates fall within the city
    let withinCity;
    if (args.city)
      withinCity = sequelize.literal(`ST_CONTAINS(ST_GEOMFROMTEXT(
      'POLYGON((${config.cities[args.city]
        .map((coord) => coord[1] + ' ' + coord[0])
        .join(', ')}))'), POINT(\`pokemon\`.\`lon\`, \`pokemon\`.\`lat\`))`);
    const dbPokemon = await pokemon.findAll({
      ...(args.center && { order: distance }),
      where: {
        [Op.and]: [
          // coordinates / radius args
          args.center
            ? sequelize.where(distance, {
                [Op.lte]: args.radius || 10,
              })
            : true,
          // city args
          args.city ? withinCity : true,
          {
            ...(args.pokemon_id
              ? { pokemon_id: args.pokemon_id }
              : { pokemon_id: { [Op.ne]: 0 } }),
            ...(args.miniv && { iv: { [Op.gte]: args.miniv } }),
            ...(args.mincp && { cp: { [Op.gte]: args.mincp } }),
            ...(args.minlevel && { level: { [Op.gte]: args.minlevel } }),
            ...(args.rawiv && { atk_iv: args.rawiv.attack }),
            ...(args.rawiv && { def_iv: args.rawiv.defense }),
            ...(args.rawiv && { sta_iv: args.rawiv.stamina }),
          },
        ],
      },
      //@ts-ignore
      include: {
        model: pokestop,
        required: false,
      },
      limit: parseInt(process.env.SEARCH_LIMIT),
    });
    // sending confirmation message
    const confirmation = `Found ${dbPokemon.length} ${args.name || 'Pokémon'} ${
      args.center
        ? 'within ' +
          (args.radius
            ? args.unit === 'km'
              ? args.radius + 'km'
              : args.radius * 1000 + 'm'
            : '10km') +
          ' of ' +
          args.center[0] +
          ',' +
          args.center[1] +
          ' and '
        : ''
    }${args.city ? 'in ' + args.city + ' and ' : ''}${
      args.miniv ? 'with min IV ' + args.miniv + '% and ' : ''
    }${args.mincp ? 'with min CP ' + args.mincp + ' and ' : ''}${
      args.minlevel ? 'with min level ' + args.minlevel + ' and ' : ''
    }${
      args.rawiv
        ? 'with IVs ' +
          args.rawiv.attack +
          '/' +
          args.rawiv.defense +
          '/' +
          args.rawiv.stamina +
          ' and '
        : ''
    }`;
    message.channel.send(
      confirmation.endsWith(' and ')
        ? confirmation.slice(0, -5) + '.'
        : confirmation.slice(0, -1) + '.'
    );
    if (dbPokemon.length > 0) {
      // creating and sending paginated embed with results
      const embeds = dbPokemon.map((pokemon) =>
        parsePokemonDb(pokemon, message.guild.id, false)
      );
      new Embeds()
        .setArray(embeds)
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel as TextChannel)
        .setPageIndicator(true)
        .setTimeout(300000)
        .setPageIndicator(
          true,
          (page, pages) =>
            `Page ${page} of ${pages} | ${this.client.getEmoji(
              'pokemon_' + dbPokemon[page - 1].pokemon_id
            )} ${dbPokemon[page - 1].lat.toFixed(2)},${dbPokemon[
              page - 1
            ].lon.toFixed(5)}`
        )
        .build();
    }
  }
}
