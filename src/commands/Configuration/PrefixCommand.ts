import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PrefixCommand extends Command {
  public constructor() {
    super('prefix', {
      aliases: ['prefix'],
      category: 'Configuration',
      description: {
        content: 'Allows for the setting of a new server-wide prefix.',
        usage: 'prefix [ new prefix ]',
        examples: ['prefix !'],
      },
      ratelimit: 3,
      args: [
        {
          id: 'prefix',
          type: 'string',
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a valid prefix.`,
          },
        },
      ],
    });
  }

  public async exec(message: Message, args: any): Promise<Message> {
    if (!this.client.handleModPermissions(message)) return;

    await this.client.settings.set(message.guild.id, 'prefix', args.prefix);
    return message.util.send(`Successfully set prefix to ${args.prefix}`);
  }
}
