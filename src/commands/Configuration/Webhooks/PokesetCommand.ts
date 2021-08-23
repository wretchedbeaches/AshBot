import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import ntim from '../../../util/name_to_id_map.json';
import config from '../../../config.json';
import { stripIndents } from 'common-tags';

export default class PokesetCommand extends Command {
  public constructor() {
    super('pokeset', {
      aliases: ['pokeset'],
      category: 'Webhooks',
      description: {
        content:
          'Set or remove the pokemon webhook configuration for a particular channel.',
        usage: stripIndents`pokeset
        boosted \`true|false\`
        name \`pokemon's name / list of pokemon names separated by ','\`
        geofilter \`distance(km/m) lattitude,longitude|city\`
        miniv \`min iv\`
        maxiv \`max iv\`
        mincp \`min cp\`
        maxcp \`max cp\`
        minlevel \`min level\`
        maxlevel \`max level\`
        rawiv \`attack\`,\`defense\`,\`stamina\`
        train
        
        **OR**
        
        pokeset rmchannel
        
        **OR**
        
        pokeset rmpokemon \`name1,name2,name3,...\``,
        examples: [
          'pokeset boosted true geofilter 10km 50.393057,-4.112226 miniv 10 maxiv 100 mincp 1000 maxcp 4000 minlevel 1 maxlevel 2 rawiv 15/15/15 pikachu,electabuzz',
          'pokeset rmchannel',
          'pokeset rmpokemon pikachu,electabuzz',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'rmchannel',
          type: 'string',
          flag: ['rmchannel'],
          match: 'flag',
        },
        {
          id: 'rmpokemon',
          type: (_: Message, str: string): null | string[] => {
            const names = str.split(',').map((name) => name.toLowerCase());
            if (names.every((name) => Object.keys(ntim).includes(name)))
              return names;
            return null;
          },
          flag: ['rmpokemon'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid pokemon name, or set of names separated by commas.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid pokemon name, or set of names separated by commas.`,
          },

          match: 'option',
        },
        {
          id: 'train',
          type: (_: Message, str: string): null | boolean => {
            if (['true', 'false'].includes(str)) return str === 'true';
            return null;
          },
          flag: ['train'],
          match: 'flag',
        },
        {
          id: 'boosted',
          type: (_: Message, str: string): null | boolean => {
            if (['true', 'false'].includes(str)) return str === 'true';
            return null;
          },
          flag: ['boosted'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid boosted value, either **true** or **false**.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid boosted value, either **true** or **false**.`,
          },

          match: 'option',
        },
        {
          id: 'name',
          type: (_: Message, str: string): null | string[] => {
            const names = str.split(',').map((name) => name.toLowerCase());
            if (names.every((name) => Object.keys(ntim).includes(name)))
              return names;
            return null;
          },
          flag: ['name'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid pokemon name, or set of names separated by commas.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid pokemon name, or set of names separated by commas.`,
          },

          match: 'option',
        },
        {
          id: 'geofilter',
          type: (_: Message, str: string): null | string | Object => {
            try {
              if (str.startsWith('geofilter')) str = str.substring(10);
              if (Object.keys(config.cities).includes(str.toLowerCase()))
                return str;
              const parts = str.split(' ');
              if (parts[0].endsWith('km') || parts[0].endsWith('m')) {
                return {
                  center: [
                    Number(parts[1].split(',')[0]),
                    Number(parts[1].split(',')[1]),
                  ],
                  radius: parts[0].endsWith('km')
                    ? Number(parts[0].substring(0, parts[0].indexOf('km')))
                    : Number(parts[0].substring(0, parts[0].indexOf('m'))),
                };
              }
              return null;
            } catch (e) {
              return null;
            }
          },
          flag: ['option'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid geofilter. Geofilters can either be in the format \`distance\` \`km or m\` \`lattitude\`,\`longitude\` or a city.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid geofilter. Geofilters can either be in the format \`distance\` \`km or m\` \`lattitude\`,\`longitude\` or a city.`,
          },
          match: 'rest',
        },
        {
          id: 'miniv',
          type: (_: Message, str: string): null | number => {
            const miniv = Number(str);
            if (isNaN(miniv)) return null;
            if (miniv < 0 || miniv > 100) return null;
            else return miniv;
          },
          flag: ['miniv'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid miniv amount, which must be an integer between 0 and 100.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid miniv amount, which must be an integer between 0 and 100.`,
          },

          match: 'option',
        },
        {
          id: 'maxiv',
          type: (_: Message, str: string): null | number => {
            const maxiv = Number(str);
            if (isNaN(maxiv)) return null;
            if (maxiv < 0 || maxiv > 100) return null;
            else return maxiv;
          },
          flag: ['maxiv'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid maxiv amount, which must be an integer between 0 and 100.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid maxiv amount, which must be an integer between 0 and 100.`,
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
          flag: ['mincp'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid mincp amount, which must be an integer between 0 and 4000.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid mincp amount, which must be an integer between 0 and 4000.`,
          },

          match: 'option',
        },
        {
          id: 'maxcp',
          type: (_: Message, str: string): null | number => {
            const maxcp = Number(str);
            if (isNaN(maxcp)) return null;
            if (maxcp < 0 || maxcp > 4000) return null;
            else return maxcp;
          },
          flag: ['maxcp'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid maxcp amount, which must be an integer between 0 and 4000.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid maxcp amount, which must be an integer between 0 and 4000.`,
          },

          match: 'option',
        },
        {
          id: 'minlevel',
          type: (_: Message, str: string): null | number => {
            const minlevel = Number(str);
            if (isNaN(minlevel)) return null;
            if (minlevel < 0 || minlevel > 4000) return null;
            else return minlevel;
          },
          flag: ['minlevel'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid minlevel amount, which must be an integer between 0 and 40.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid minlevel amount, which must be an integer between 0 and 40.`,
          },

          match: 'option',
        },
        {
          id: 'maxlevel',
          type: (_: Message, str: string): null | number => {
            const maxlevel = Number(str);
            if (isNaN(maxlevel)) return null;
            if (maxlevel < 0 || maxlevel > 4000) return null;
            else return maxlevel;
          },
          flag: ['maxlevel'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid maxlevel amount, which must be an integer between 0 and 40.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid maxlevel amount, which must be an integer between 0 and 40.`,
          },

          match: 'option',
        },
        {
          id: 'rawiv',
          type: (_: Message, str: string): null | {} => {
            let attack: number, defense: number, stamina: number;
            try {
              const splitArg = str.split('/');
              attack = parseInt(splitArg[0]);
              defense = parseInt(splitArg[1]);
              stamina = parseInt(splitArg[2]);
            } catch (e) {
              return null;
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
          flag: ['rawiv'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid rawiv value, which must be in the format (\`attack\`,\`defense\`,\`stamina\`) where attack, defense, and stamina are all between 0 and 15 (inclusive).`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid rawiv value, which must be in the format (\`attack\`,\`defense\`,\`stamina\`) where attack, defense, and stamina are all between 0 and 15 (inclusive).`,
          },

          match: 'option',
        },
      ],
    });
  }

  public async exec(message: Message, args: any): Promise<Message> {
    if (!this.client.handleAdminPermissions(message)) return;
    const settings = this.client.settings.get(message.guild.id, 'channels', {});
    if (args.rmchannel) {
      delete settings[message.channel.id];
      await this.client.settings.set(message.guild.id, 'channels', settings);
      if (this.client.intervals[message.channel.id]) {
        clearInterval(this.client.intervals[message.channel.id]);
        delete this.client.intervals[message.channel.id];
        delete this.client.embedQueue[message.channel.id];
        delete this.client.trains[message.channel.id];
      }
      return message.util.send(
        "Successfully removed channel's pokemon webhook configuration."
      );
    } else if (args.rmpokemon) {
      if (!settings[message.channel.id])
        return message.channel.send(
          `${message.author}, you need to use this command in a channel where a pokemon webhook configuration is already set.`
        );
      settings[message.channel.id].name = settings[
        message.channel.id
      ].name.filter((name) => !args.rmpokemon.includes(name));
      await this.client.settings.set(message.guild.id, 'channels', settings);
      return message.channel.send(
        `Successfully removed pokemon(s) ${args.rmpokemon.join(
          ','
        )} from webhook channel ${message.channel}`
      );
    } else {
      for (let arg in args)
        if (
          args[arg] === null ||
          arg === 'rmpokemon' ||
          arg === 'rmchannel' ||
          (arg === 'geofilter' && args[arg].radius === null)
        )
          delete args[arg];
      args.type = 'pokemon';
      settings[message.channel.id] = {
        ...settings[message.channel.id],
        ...args,
      };
      await this.client.settings.set(message.guild.id, 'channels', settings);
      if (this.client.intervals[message.channel.id])
        clearInterval(this.client.intervals[message.channel.id]);
      this.client.embedQueue[message.channel.id] = [];
      this.client.intervals[message.channel.id] = setInterval(async () => {
        if (
          this.client.embedQueue[message.channel.id] &&
          this.client.embedQueue[message.channel.id].length > 0
        ) {
          let channel = this.client.channels.cache.get(message.channel.id);
          if (!channel)
            channel = await this.client.channels.fetch(message.channel.id);
          if (
            !((channel): channel is TextChannel => channel.type === 'text')(
              channel
            )
          )
            return;
          const embed = this.client.embedQueue[message.channel.id][0];
          channel.send({
            content: embed.coordinates
              ? `${embed.coordinates[0]}, ${embed.coordinates[1]}`
              : embed.message,
            embed: embed.embed,
          });
          this.client.embedQueue[message.channel.id] = this.client.embedQueue[
            message.channel.id
          ].slice(1, this.client.embedQueue[message.channel.id].length);
        }
      }, Number(process.env.QUEUE_INTERVAL));
      delete this.client.trains[message.channel.id];
      return message.util.send(
        "Successfully updated channel's pokemon webhook configuration."
      );
    }
  }
}