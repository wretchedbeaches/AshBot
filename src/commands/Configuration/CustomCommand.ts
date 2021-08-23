import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { FieldsEmbed } from 'discord-paginationembed';

export default class CustomCommand extends Command {
  public constructor() {
    super('custom', {
      aliases: ['custom', 'cc'],
      category: 'Configuration',
      description: {
        content: 'Configure custom commands.',
        usage:
          'custom `{command name}` `{command text}`\ncustom remove `{command name}`\ncustom get',
        examples: ['custom pta Welcome to Pokemon PTA.'],
      },
      args: [
        {
          id: 'commandName',
          type: 'string',
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a valid custom command name.`,
          },
        },
        {
          id: 'commandText',
          type: 'string',
          match: 'rest',
        },
      ],
      ratelimit: 3,
    });
  }

  public async exec(
    message: Message,
    { commandName, commandText }
  ): Promise<Message> {
    if (!this.client.handleModPermissions(message)) return;
    if (commandName === 'remove') {
      let customCommands = this.client.settings.get(
        message.guild.id,
        'customCommands',
        {}
      );
      delete customCommands[commandText];
      await this.client.settings.set(
        message.guild.id,
        'customCommands',
        customCommands
      );
      message.channel.send(
        `${message.author}, successfully removed custom command \`${commandText}\`.`
      );
    } else if (commandName === 'get') {
      const embed = new FieldsEmbed();
      embed.embed = this.client
        .embed(message.guild.id)
        .setTitle(`Custom Commands`);
      const array = [];
      const customCommands = await this.client.settings.get(
        message.guild.id,
        'customCommands',
        null
      );
      if (
        customCommands instanceof Object &&
        Object.keys(customCommands).length > 0
      ) {
        for (let commandName in customCommands)
          array.push({
            value: `**${commandName}**`,
          });
      } else array.push({ value: `No custom commands set.` });
      embed
        .setArray(array)
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel as TextChannel)
        .setPageIndicator(true)
        .setElementsPerPage(parseInt(process.env.FIELDS_LENGTH))
        .formatField('Commands', (el) => (el as any).value)
        .build();
    } else {
      let customCommands = this.client.settings.get(
        message.guild.id,
        'customCommands',
        {}
      );
      customCommands[commandName] = commandText;
      await this.client.settings.set(
        message.guild.id,
        'customCommands',
        customCommands
      );
      message.channel.send(
        `${message.author}, successfully created custom command \`${commandName}\` with text **${commandText}**.`
      );
    }
  }
}
