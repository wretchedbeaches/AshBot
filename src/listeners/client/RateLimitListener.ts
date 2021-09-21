import { RateLimitData, TextChannel } from 'discord.js';
import Listener from '../../struct/listeners/Listener';

export default class RateLimitListener extends Listener {
  public constructor() {
    super('rateLimit', {
      emitter: 'client',
      event: 'rateLimit',
      category: 'client',
    });
  }

  public execute(rateLimitData: RateLimitData): void {
    // TODO: Update logging to use winston
    console.log("Rate Limit Hit:");
    console.log(rateLimitData);
  }
}