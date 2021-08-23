import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class ShinysetCommand extends Command {
  public constructor() {
    super('shinyhook', {
      aliases: ['shinyhook'],
      description: {
        content:
          'Configure the channel where instances can be set for collection of shiny pokemon.',
        usage: stripIndents`shinyhook
        
        **OR**
        
        shinyhook rmchannel`,
        examples: ['shinyhook', 'shinyhook rmchannel'],
      },
      ratelimit: 3,
      args: [
        {
          id: 'rmchannel',
          flag: ['rmchannel'],
          match: 'flag',
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
        "Successfully removed channel's shiny webhook configuration."
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
      args.type = 'pokemon';
      args.shiny = true;
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
          const embed = await this.client.embedQueue[message.channel.id][0];
          const embedMessage = await channel.send({
            content: embed.coordinates
              ? `${embed.coordinates[0]}, ${embed.coordinates[1]}`
              : embed.message,
            embed: embed.embed,
          });
          if (embed.shiny)
            this.client.handleShinyReactions(embedMessage, embed.user);
          this.client.embedQueue[message.channel.id] = this.client.embedQueue[
            message.channel.id
          ].slice(1, this.client.embedQueue[message.channel.id].length);
        }
      }, Number(process.env.QUEUE_INTERVAL));
      delete this.client.trains[message.channel.id];
      return message.util.send(
        "Successfully updated channel's shiny webhook configuration."
      );
    }
  }
}

