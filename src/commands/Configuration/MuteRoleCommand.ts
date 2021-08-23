import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class MuteRoleCommand extends Command {
  public constructor() {
    super('muterole', {
      aliases: ['muterole'],
      category: 'Configuration',
      description: {
        content: 'Configure the role to assign to users on mute.',
        usage: 'muterole @`mute role`',
        examples: ['muterole @muted'],
      },
      args: [
        {
          id: 'role',
          type: 'role',
          prompt: {
            optional: false,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid role to serve as the mute role.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid role to server as the mute role.`,
          },
        },
      ],
      ratelimit: 3,
    });
  }

  public async exec(message: Message, args): Promise<Message> {
    if (!this.client.handleAdminPermissions(message)) return;

    await this.client.settings.set(
      message.guild.id,
      'muteRoleId',
      args.role.id
    );
    return message.util.send(`Successfully set mute role to ${args.role}`);
  }
}
