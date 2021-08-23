import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import config from '../../config.json';
import ntim from '../../util/name_to_id_map.json';
import masterfile from '../../util/masterfile.json';
import { pokestop } from '../../rdmdbModels/pokestop';
import sequelize, { Op } from 'sequelize';
import { FieldsEmbed } from 'discord-paginationembed';
import util from '../../util/util.json';
import { parseQuestDb } from '../../util/parse';

export default class QuestsearchCommand extends Command {
  public constructor() {
    super('quest', {
      aliases: ['quest', 'questsearch'],
      category: 'Search',
      description: {
        content: 'Search for quests.',
        usage: stripIndents`quest pokemon \`pokemon name\` \`distance(km/m) latitude,longitude\` \`city\`

        **OR**
        quest item "\`item name\`" \`distance(km/m) latitude,longitude\` \`city\`

        **OR**
        quest stardust \`stardust amount\` \`distance(km/m) latitude,longitude\` \`city\`,

        **OR**
        quest mega pokemon \`pokemon name\` \`distance(km/m) latitude,longitude\` \`city\``,
        examples: [
          'quest item "sun stone" plymouth',
          'quest pokemon pikachu 10km 35.482501,139.631672',
          'quest stardust 1200',
          'quest mega beedrill',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'type',
          type: (_: Message, str: string): boolean | string => {
            if (['pokemon', 'item', 'stardust', 'mega'].includes(str.toLowerCase()))
              return str.toLowerCase();
            return null;
          },
          prompt: {
            optional: false,
            start: (msg: Message) =>
              `${msg.author}, please provide valid reward type, either **pokemon**, **item**, **stardust**, **mega**.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide valid reward type, either **pokemon**, **item**, **stardust**, **mega**.`,
          },
          match: 'phrase',
        },
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
          id: 'item',
          type: (_: Message, str: string): boolean | Object => {
            for (let itemId in masterfile.items)
              if (
                masterfile.items[itemId].name.toLowerCase() ===
                str.toLowerCase()
              )
                return {
                  itemId: parseInt(itemId),
                  itemName: masterfile.items[itemId].name,
                };
            return false;
          },
          match: 'separate',
        },
        {
          id: 'amount',
          type: 'integer',
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
              `${msg.author}, please provide a valid distance, which must end in either **km** or **m**.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid distance, which must end in either **km** or **m**.`,
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
              `${msg.author}, please provide a valid starting point, which must consist of latitude and longitude. Example: **35.482501, 139.631672**.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid starting point, which must consist of latitude and longitude. Example: **35.482501, 139.631672**.`,
          },
          match: 'separate',
        },
      ],
    });
  }

  public async exec(message: Message, args): Promise<Message> {
    for (let arg in args) {
      if (!args[arg]) delete args[arg];
      if (
        ['name', 'city', 'radius', 'item', 'center'].includes(arg) &&
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
         * COS(RADIANS(\`pokestop\`.\`lat\`))
         * COS(RADIANS(${args.center[1]} - \`pokestop\`.\`lon\`))
         + SIN(RADIANS(${args.center[0]}))
         * SIN(RADIANS(\`pokestop\`.\`lat\`)))))`
        )
      : null;

    // raw sql literal to check whether a given pokemon's coordinates fall within the city
    let withinCity, dbQuests;
    let embed = new FieldsEmbed();
    embed.embed = this.client.embed(message.guild.id);
    if (args.city)
      withinCity = sequelize.literal(`ST_CONTAINS(ST_GEOMFROMTEXT(
      'POLYGON((${config.cities[args.city]
        .map((coord) => coord[1] + ' ' + coord[0])
        .join(', ')}))'), POINT(\`pokestop\`.\`lon\`, \`pokestop\`.\`lat\`))`);
    switch (args.type) {
      case 'pokemon':
        if (!args.name)
          return message.channel.send(
            `Must specify a pokemon name for pokemon reward type quests.`
          );
        dbQuests = await pokestop.findAll({
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
                quest_reward_type: 7,
                quest_pokemon_id: args.pokemon_id,
              },
            ],
          },
          limit: parseInt(process.env.SEARCH_LIMIT),
        });
        embed.embed
          .setTitle(
            `Quests For Pokemon ${args.name
              .charAt(0)
              .toUpperCase()}${args.name.substring(1).toLowerCase()}`
          )
          .setColor(
            `#${util.types[
              masterfile.pokemon['' + args.pokemon_id].types[0]
            ].color.toString(16)}`
          )
          .setThumbnail(
            `https://play.pokemonshowdown.com/sprites/xyani/${args.name.toLowerCase()}.gif`
          );
        break;
      case 'mega':
        if (!args.name)
          return message.channel.send(
            `Must Specify a Pokemon Name For Mega Energy Reward Type Quests.`
          );
        dbQuests = await pokestop.findAll({
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
                quest_reward_type: 12,
                quest_rewards: { [Op.like]: `%"pokemon_id":${args.pokemon_id}%` },
              },
            ],
          },
          limit: parseInt(process.env.SEARCH_LIMIT),
        });
        embed.embed
          .setTitle(
            `Mega Energy Quests For ${args.name
              .charAt(0)
              .toUpperCase()}${args.name.substring(1).toLowerCase()}`
          )
          .setColor(
            `#${util.types[
              masterfile.pokemon['' + args.pokemon_id].types[0]
            ].color.toString(16)}`
          )
          .setThumbnail(
            `https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_mega_energy_${args.pokemon_id}.png`
          );
        break;  
      case 'item':
        if (!args.item || !args.item.itemId)
          return message.channel.send(`Must specify an valid quest "item" in quotes. \n Ex. quest item "rare candy"` );
        dbQuests = await pokestop.findAll({
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
                quest_reward_type: 2,
                quest_item_id: args.item.itemId,
              },
            ],
          },
          limit: parseInt(process.env.SEARCH_LIMIT),
        });
        embed.embed
         .setTitle(
           `Quests With Reward ${args.item.itemName}`
          )
          .setThumbnail(
            `https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_${args.item.itemId}_1.png`
          );
        break;
      case 'stardust':
        if (!args.amount)
          return message.channel.send(
            `Must specify a stardust amount for stardust reward type quests.`
          );
        dbQuests = await pokestop.findAll({
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
                quest_reward_type: 3,
                quest_rewards: { [Op.like]: `%"amount":${args.amount}%` },
              },
            ],
          },
          limit: parseInt(process.env.SEARCH_LIMIT),
        });
        embed.embed
          .setTitle(
          `Quests With Stardust Amount ${args.amount}`
        )
        .setThumbnail(
          `https://i.imgur.com/WimkNLf.png`
        );
        break;
    }
    const fields = dbQuests.map((dbQuest) => parseQuestDb(dbQuest));
    embed
      .setArray(fields.length > 0 ? fields : [{ value: 'No quests found.' }])
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel as TextChannel)
      .setPageIndicator(true)
      .setElementsPerPage(parseInt(process.env.FIELDS_LENGTH))
      .formatField('Quests', (el) => (el as any).value)
      .setTimeout(300000)
      .build();
  }
}
