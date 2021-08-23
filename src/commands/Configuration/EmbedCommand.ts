import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class EmbedCommand extends Command {
  public constructor() {
    super('embed', {
      aliases: ['embed'],
      category: 'Configuration',
      description: {
        content: 'Configure embed looks.',
        usage:
          'embed footer `footer text` footerImage `footer image URL` color `color`',
        examples: [
          'embed footer Pokemon PTA v 1.0 footerImage https://cdn.discordapp.com/attachments/797554852288528474/797885619480952922/Screenshot_from_2021-01-10_11-52-16.png color BLUE',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'footer',
          type: 'string',
          flag: ['footer'],
          match: 'rest',
        },
        {
          id: 'footerImage',
          type: 'url',
          flag: ['footerImage'],
          match: 'option',
          prompt: {
            optional: true,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid footer image url.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid footer image url.`,
          },
        },
        {
          id: 'color',
          type: 'string',
          flag: ['color'],
          match: 'option',
        },
      ],
    });
  }

  public async exec(message: Message, args): Promise<Message> {
    if (!this.client.handleModPermissions(message)) return;
    if (args.footer)
      await this.client.settings.set(
        message.guild.id,
        'footer',
        args.footer.substring(7)
      );
    if (args.footerImage)
      await this.client.settings.set(
        message.guild.id,
        'footerImage',
        args.footerImage.href
      );
    if (args.color)
      await this.client.settings.set(
        message.guild.id,
        'color',
        args.color.toUpperCase()
      );
    return message.channel.send('Succesfully updated embed configuration.');
  }
}
