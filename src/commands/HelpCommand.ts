import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';
import { PrefixSupplier } from 'discord-akairo';

export default class HelpCommand extends Command {
  public constructor() {
    super('help', {
      aliases: ['help', 'commands'],
      category: 'Public Commands',
      description: {
        content: 'View available commands on the bot',
        usage: 'help [command]',
        examples: ['help', 'help ping'],
      },
      ratelimit: 3,
      args: [
        {
          id: 'command',
          type: 'commandAlias',
          default: null,
        },
      ],
    });
  }

  public exec(message: Message, { command }): Promise<Message> {
    if (command) {
      return message.channel.send(
        this.client
          .embed(message.guild.id)
          .setAuthor(`Help | ${command}`, this.client.user.avatarURL())
          .setDescription(stripIndents`
          **Description:**
          ${command.description.content || 'No content provided.'}

          **Usage:**
          ${command.description.usage || 'No usage provided'}

          **Examples:**
          ${
            command.description.examples
              ? command.description.examples
                  .map((example) => `\`${example}\``)
                  .join('\n')
              : 'No examples provided.'
          }
          `)
      );
    }
    const embed = this.client
      .embed(message.guild.id)
      .setAuthor(
        `Help | ${this.client.user.username}`,
        this.client.user.avatarURL()
      )
      .setFooter(
        `${(this.client.commandHandler.prefix as PrefixSupplier)(
          message
        )}help [command] for more information on a command`
      );

    for (const category of this.handler.categories.values()) {
      if (['default'].includes(category.id)) continue;
      embed.addField(
        category.id,
        category
          .filter((cmd) => cmd.aliases.length > 0)
          .map((cmd) => `**\`${cmd}\`**`)
          .join(',') || 'No commands in this category.'
      );
    }

    return message.channel.send(embed);
  }
}
