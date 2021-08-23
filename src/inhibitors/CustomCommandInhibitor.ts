import { Inhibitor, PrefixSupplier } from 'discord-akairo';

export default class CustomCommandInhibitor extends Inhibitor {
  constructor() {
    super('custom command', {
      reason: 'custom command',
      type: 'pre',
    });
  }

  exec(message) {
    if (!message.guild) return;
    const customCommands = this.client.settings.get(
      message.guild.id,
      'customCommands',
      {}
    );
    if (
      message.content.startsWith(
        (this.client.commandHandler.prefix as PrefixSupplier)(message)
      ) &&
      Object.keys(customCommands).includes(message.content.substring(1))
    ) {
      return message.channel.send(
        this.client
          .embed(message.guild.id)
          .setDescription(customCommands[message.content.substring(1)])
      );
    }
    return false;
  }
}
