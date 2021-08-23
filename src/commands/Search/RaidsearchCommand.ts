import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { Embeds } from 'discord-paginationembed';
import sequelize, { Op, Model } from 'sequelize';
import ntim from '../../util/name_to_id_map.json';
import config from '../../config.json';
import { stripIndents } from 'common-tags';
import { gym } from '../../rdmdbModels/gym';
import { parseRaidDb } from '../../util/parse';
import util from '../../util/util.json';

export default class RaidsearchCommand extends Command {
  public constructor() {
    super('raidsearch', {
      aliases: ['raidsearch', 'raid'],
      category: 'Search',
      description: {
        content: 'Search for raids.',
        usage: stripIndents`raidsearch
        \`pokemon's name\`
        \`distance(km/m) lattitude,longitude\`
        \`city\`
        ex \`true|false\`
        \`team\`
        level \`raid level\``,
        examples: [
          'raidsearch name pikachu geofilter 10km 85.4,-92.8 ex true team valor level 5',
        ],
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
              ? false
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
              `${msg.author}, please provide a valid radius, which must end in either **km** or **m**.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid radius, which must end in either **km** or **m**.`,
          },
          match: 'separate',
        },
        {
          id: 'ex',
          type: (_: Message, str: string): null | boolean => {
            if (['true', 'false'].includes(str)) return str === 'true';
            return null;
          },
          flag: ['ex'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid ex value, either **true** or **false**.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid ex value, either **true** or **false**.`,
          },

          match: 'option',
        },
        {
          id: 'team',
          type: (_: Message, str: string): boolean | string => {
            if (
              ['uncontested', 'mystic', 'valor', 'instinct'].includes(
                str.toLowerCase()
              )
            )
              return str.toLowerCase();
            return false;
          },
          match: 'separate',
        },
        {
          id: 'level',
          type: (_: Message, str: string): null | number => {
            const level = Number(str);
            if (isNaN(level)) return null;
            else return level;
          },
          flag: ['level'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid level amount.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid level amount.`,
          },

          match: 'option',
        },
      ],
    });
  }

  public async exec(message: Message, args) {
    for (let arg in args) {
      if (args[arg] === null || args[arg] === false) delete args[arg];
      if (
        ['name', 'city', 'radius', 'city', 'team', 'center'].includes(arg) &&
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
    // raw sql literal for distance between the args's latitude,longitude and a given pokemon's coordinates
    const distance =
      args.geofilter && args.geofilter.center
        ? sequelize.literal(
            `111.111 *
  DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${args.geofilter.center[0]}))
       * COS(RADIANS(\`gym\`.\`lat\`))
       * COS(RADIANS(${args.geofilter.center[1]} - \`gym\`.\`lon\`))
       + SIN(RADIANS(${args.geofilter.center[0]}))
       * SIN(RADIANS(\`gym\`.\`lat\`)))))`
          )
        : null;

    // raw sql literal to check whether a given pokemon's coordinates fall within the args's city
    let withinCity;
    if (args.geofilter && !args.geofilter.center)
      withinCity = sequelize.literal(`ST_CONTAINS(ST_GEOMFROMTEXT(
    'POLYGON((${config.cities[args.geofilter]
      .map((coord) => coord[1] + ' ' + coord[0])
      .join(', ')}))'), POINT(\`gym\`.\`lon\`, \`gym\`.\`lat\`))`);
    const dbRaids = await gym.findAll({
      ...(args.geofilter && args.geofilter.center && { order: distance }),
      where: {
        [Op.and]: [
          // coordinates / radius args
          args.geofilter && args.geofilter.center
            ? sequelize.where(distance, {
                [Op.lte]: args.geofilter.radius || 10,
              })
            : true,
          // city args
          args.geofilter && !args.geofilter.center ? withinCity : true,
          {
            ...(args.pokemon_id
              ? { raid_pokemon_id: args.pokemon_id }
              : { raid_pokemon_id: { [Op.ne]: 0 } }),
            ...(args.level && { raid_level: { [Op.eq]: args.level } }),
            ...(args.ex !== undefined && { ex_raid_eligible: args.ex ? 1 : 0 }),
            ...(args.team && {
              team_id: Object.keys(util.teams).find(
                (team_id) =>
                  util.teams[team_id].name.toLowerCase() === args.team
              ),
            }),
          },
        ],
      },
      limit: parseInt(process.env.SEARCH_LIMIT),
    });
    // sending confirmation message
    const confirmation = `Found ${dbRaids.length} ${
      args.ex === true
        ? 'ex eligible '
        : args.ex === false
        ? 'ex uneligible '
        : ''
    }${args.name ? args.name + ' ' : ''}raids ${
      args.geofilter && args.geofilter.center
        ? 'within ' +
          (args.geofilter.radius
            ? args.geofilter.unit === 'km'
              ? args.geofilter.radius + 'km'
              : args.geofilter.radius * 1000 + 'm'
            : '10km') +
          ' of ' +
          args.geofilter.center[0] +
          ',' +
          args.geofilter.center[1] +
          ' and '
        : ''
    }${
      args.geofilter && !args.geofilter.center
        ? 'in ' + args.geofilter + ' and '
        : ''
    }${args.level ? 'with level ' + args.level + ' and ' : ''}${
      args.team ? 'with team ' + args.team + ' and ' : ''
    }`;
    message.channel.send(
      confirmation.endsWith(' and ')
        ? confirmation.slice(0, -5) + '.'
        : confirmation.slice(0, -1) + '.'
    );
    if (dbRaids.length > 0) {
      // creating and sending paginated embed with results
      const embeds = dbRaids.map((raid) => parseRaidDb(raid, message.guild.id));
      const fieldsEmbed = new Embeds()
        .setArray(embeds)
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel as TextChannel)
        .setPageIndicator(true)
        .setTimeout(300000)
        .setPageIndicator(
          true,
          (page, pages) =>
            `Page ${page} of ${pages} | ${this.client.getEmoji(
              'pokemon_' + dbRaids[page - 1].raid_pokemon_id
            )} ${dbRaids[page - 1].lat.toFixed(5)},${dbRaids[
              page - 1
            ].lon.toFixed(5)}`
        )
        .build();
    }
  }
}
