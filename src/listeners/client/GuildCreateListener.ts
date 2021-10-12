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

	public async execute(guild: Guild) {
		await this.client?.commandHandler.initGuild(guild);
	}
}
