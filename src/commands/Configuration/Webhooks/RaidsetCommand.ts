import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import ntim from '../../../util/name_to_id_map.json';
import config from '../../../config.json';
import { stripIndents } from 'common-tags';

export default class RaidsetCommand extends Command {
  public constructor() {
    super('raidset', {
      aliases: ['raidset'],
      category: 'Webhooks',
      description: {
        content:
          'Set or remove the raid webhook configuration for a particular channel.',
        usage: stripIndents`raidset
          ex \`true|false\`
          team \`uncontested|mystic|valor|instinct\`
          boosted \`true|false\`
          name \`pokemon's name\`
          geofilter \`distance(km/m) lattitude,longitude|city\`
          miniv \`min iv\`
          maxiv \`max iv\`
          mincp \`min cp\`
          maxcp \`max cp\`
          minlevel \`min level\`
          maxlevel \`max level\`
          train

          **OR**
          
          raidset rmchannel`,
        examples: [
          'raidset team valor ex true boosted true name pikachu geofilter 10km 41.693066,-0.854559 miniv 0 maxiv 100 mincp 0 maxcp 4000 minlevel 1 maxlevel 5',
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
          id: 'train',
          type: (_: Message, str: string): null | boolean => {
            if (['true', 'false'].includes(str)) return str === 'true';
            return null;
          },
          flag: ['train'],
          match: 'flag',
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
          type: (_: Message, str: string): null | string => {
            if (
              ['uncontested', 'mystic', 'valor', 'instinct'].includes(
                str.toLowerCase()
              )
            )
              return str.toLowerCase();
            return null;
          },
          flag: ['team'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid team value, either **uncontested**, **mystic**, **valor**, or **instinct**.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid team value, either **uncontested**, **mystic**, **valor**, or **instinct**.`,
          },
          match: 'option',
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
              `${msg.author}, please provide a valid prefix.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid prefix.`,
          },
          match: 'option',
        },
        {
          id: 'name',
          type: (_: Message, str: string): null | string => {
            if (Object.keys(ntim).includes(str.toLowerCase()))
              return str.toLowerCase();
            return null;
          },
          flag: ['name'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid pokemon name.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid pokemon name.`,
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
            if (minlevel < 0 || minlevel > 40) return null;
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
      ],
    });
  }

  public async exec(message: Message, args: any): Promise<Message> {
    if (!this.client.handleAdminPermissions(message)) return;
    if (args.rmchannel) {
      const settings = this.client.settings.get(
        message.guild.id,
        'channels',
        {}
      );
      delete settings[message.channel.id];
      await this.client.settings.set(message.guild.id, 'channels', settings);
      if (this.client.intervals[message.channel.id]) {
        clearInterval(this.client.intervals[message.channel.id]);
        delete this.client.intervals[message.channel.id];
        delete this.client.embedQueue[message.channel.id];
        delete this.client.trains[message.channel.id];
      }
      return message.util.send(
        "Successfully removed channel's raid webhook configuration."
      );
    } else {
      const settings = this.client.settings.get(
        message.guild.id,
        'channels',
        {}
      );
      for (let arg in args) {
        if (
          args[arg] === null ||
          arg === 'rmchannel' ||
          (arg === 'geofilter' && args[arg].radius === null)
        )
          delete args[arg];
      }
      args.type = 'raid';
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
        "Successfully updated channel's raid webhook configuration."
      );
    }
  }
}
