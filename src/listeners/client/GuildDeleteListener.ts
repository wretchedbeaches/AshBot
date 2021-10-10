import { Guild } from 'discord.js';
import Listener from '../../struct/listeners/Listener';

export default class GuildDeleteListener extends Listener {
	public constructor() {
		super('guildDelete', {
			emitter: 'client',
			event: 'guildDelete',
			category: 'client',
		});
	}

	public execute(guild: Guild) {
		this.client?.commandHandler.removeGuild(guild.id);
	}
}
