import { Channel, GuildChannel } from 'discord.js';
import Listener from '../../struct/listeners/Listener';

export default class ChannelDeleteListener extends Listener {
	public constructor() {
		super('channelDelete', {
			emitter: 'client',
			event: 'channelDelete',
			category: 'client',
		});
	}

	public async execute(channel: Channel): Promise<void> {
		if (channel.isText() && channel instanceof GuildChannel) {
			const guildId = channel.guildId;
			const guildChannels = this.client!.settings.get(guildId, 'channels', {});
			if (guildChannels[channel.id]) {
				// delete the channel from the guild AND update that into the db
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete guildChannels[channel.id];
				await this.client!.settings.set(guildId, 'channels', guildChannels);
			}
		}
	}
}
