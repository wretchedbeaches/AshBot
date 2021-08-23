import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class AdminCommand extends Command {
  public constructor() {
    super('admin', {
      aliases: ['admin', 'adminRole'],
      category: 'Configuration',
      description: {
        content: 'Configure the admin role.',
        usage: 'admin',
        examples: ['admin'],
      },
      ratelimit: 3,
      userPermissions: ['MANAGE_GUILD'],
      args: [
        {
          id: 'adminRole',
          type: 'role',
          prompt: {
            optional: false,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid admin role.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid admin role.`,
          },
          match: 'rest',
        },
      ],
    });
  }

  public async exec(message: Message, { adminRole }): Promise<Message> {
    await this.client.settings.set(
      message.guild.id,
      'adminRoleId',
      adminRole.id
    );
    return message.channel.send(`Successfully set admin role to ${adminRole}`);
  }
}
