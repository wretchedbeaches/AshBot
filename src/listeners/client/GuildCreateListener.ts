import { Guild } from 'discord.js';
import Listener from '../../struct/listeners/Listener';

export default class GuildCreateListener extends Listener {
	public constructor() {
		super('guildCreate', {
			emitter: 'client',
			event: 'guildCreate',
			category: 'client',
		});
	}

	public execute(guild: Guild) {
		return this.client?.interactionManager?.registerInteractionForGuild(guild).catch((error) => {
			this.client?.logger.error(`Failed to register interactions for a new guild`, { error, guild });
		});
	}
}
