import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class SendembedCommand extends Command {
  public constructor() {
    super('sendembed', {
      aliases: ['sendembed'],
      category: 'Utilies',
      description: {
        content: 'Send an embed to a specific channel.',
        usage: 'sendembed #`channel` `message content`',
        examples: ['sendembed #general this text will go inside of an embed.'],
      },
      ratelimit: 3,
      args: [
        {
          id: 'channel',
          type: 'channelMention',
          prompt: {
            optional: false,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid channel to send the embed to.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid channel to send the embed to.`,
          },
        },
        {
          id: 'content',
          type: 'string',
          match: 'rest',
        },
      ],
    });
  }

  public exec(message: Message, { channel, content }): Promise<Message> {
    if (!this.client.handleModPermissions(message)) return;
    channel.send(this.client.embed(message.guild.id).setDescription(content));
    return message.channel.send(
      `${message.author}, sent embed message with content \`${content}\` to ${channel}`
    );
  }
}
