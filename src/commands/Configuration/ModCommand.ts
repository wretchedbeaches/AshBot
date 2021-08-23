import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ModCommand extends Command {
  public constructor() {
    super('mod', {
      aliases: ['mod', 'modrole'],
      category: 'Configuration',
      description: {
        content: 'Configure the mod role.',
        usage: 'mod',
        examples: ['mod'],
      },
      ratelimit: 3,
      userPermissions: ['MANAGE_GUILD'],
      args: [
        {
          id: 'modRole',
          type: 'role',
          prompt: {
            optional: false,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid mod role.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid mod role.`,
          },
          match: 'rest',
        },
      ],
    });
  }

  public async exec(message: Message, { modRole }): Promise<Message> {
    await this.client.settings.set(message.guild.id, 'modRoleId', modRole.id);
    return message.channel.send(`Successfully set mod role to ${modRole}`);
  }
}
