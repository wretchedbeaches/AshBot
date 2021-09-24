import { RateLimitData } from 'discord.js';
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
		this.client!.logger.error(`Rate limit was hit ${rateLimitData.route}`, { event: 'rateLimit', ...rateLimitData });
	}
}
