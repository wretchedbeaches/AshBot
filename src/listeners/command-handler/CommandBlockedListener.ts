import { CommandBlockedData } from '../../struct/commands/CommandHandler';
import Listener from '../../struct/listeners/Listener';
import { CommandHandlerEvents } from '../../struct/Util';

export default class CommandBlockedListener extends Listener {
  public constructor() {
    super('commandBlocked', {
      emitter: 'commandHandler',
      event: CommandHandlerEvents.COMMAND_BLOCKED,
      category: 'commandHandler',
    });
  }

  public execute({ command, reason }: CommandBlockedData): void {
    // TODO: Update logging to use winston
    console.log(`Command '${command.id}'' blocked for reason '${reason}'`);
  }
}