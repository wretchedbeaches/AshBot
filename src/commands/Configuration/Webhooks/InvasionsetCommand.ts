import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import config from '../../../config.json';

export default class invasionset extends Command {
  public constructor() {
    super('invasionset', {
      aliases: ['invasionset', 'invasion'],
      category: 'Webhooks',
      description: {
        content:
          'Set or remove the invasion webhook configuration for a particular channel.',
        usage: stripIndents`invasionset
        leader \`true|false\`
        geofilter \`distance(km/m) lattitude,longitude|city\`
        train

        **OR**
        
        invasionset rmchannel`,
        examples: ['invasionset leader true', 'invasionset rmchannel'],
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
          id: 'leader',
          type: (_: Message, str: string): null | boolean => {
            if (['true', 'false'].includes(str)) return str === 'true';
            return null;
          },
          flag: ['leader'],
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid leader value, either **true** or **false**.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid leader value, either **true** or **false**.`,
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
      ],
    });
  }

  public async exec(message: Message, args: any) {
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
        "Successfully removed channel's invasion webhook configuration."
      );
    } else {
      const settings = this.client.settings.get(
        message.guild.id,
        'channels',
        {}
      );
      for (let arg in args)
        if (args[arg] === null || arg === 'rmchannel') delete args[arg];
      args.type = 'invasion';
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
        "Successfully updated channel's invasion webhook configuration."
      );
    }
  }
}
