import { RateLimitData, TextChannel } from 'discord.js';
import { CommandBlockedData } from '../../struct/commands/CommandHandler';
import Listener from '../../struct/listeners/Listener';

export default class RateLimitListener extends Listener {
  public constructor() {
    super('commandBlocked', {
      emitter: 'commandHandler',
      event: 'commandBlocked',
      category: 'commandHandler',
    });
  }

  public execute({ command, reason }: CommandBlockedData): void {
    // TODO: Update logging to use winston
    console.log(`Command '${command.id}'' blocked for reason '${reason}'`);
  }
}