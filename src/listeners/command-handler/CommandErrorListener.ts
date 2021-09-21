import { RateLimitData, TextChannel } from 'discord.js';
import { CommandBlockedData } from '../../struct/commands/CommandHandler';
import Listener from '../../struct/listeners/Listener';
import { CommandHandlerEvents } from '../../struct/Util';

export default class RateLimitListener extends Listener {
  public constructor() {
    super('commandError', {
      emitter: 'commandHandler',
      event: CommandHandlerEvents.ERROR,
      category: 'commandHandler',
    });
  }

  public execute({ error, command }): void {
    // TODO: Update logging to use winston
    console.log(`Command '${command.id}' encountered an error.`);
    console.log(error);
  }
}