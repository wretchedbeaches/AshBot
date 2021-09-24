import { TextChannel } from 'discord.js';
import Listener from '../../struct/listeners/Listener';

export default class ChannelDeleteListener extends Listener {
	public constructor() {
		super('channelDelete', {
			emitter: 'client',
			event: 'channelDelete',
			category: 'client',
		});
	}

	public execute(channel: TextChannel): void {
		// TODO: Update logging to use winston
		console.log('Channel deleted...');
		// TODO: Update this to do original db things
		// const channels = this.client.settings.get(channel.guild.id, 'channels', {});
		// if (channels[channel.id]) delete channels[channel.id];
		// this.client.settings.set(channel.guild.id, 'channels', channels);
	}
}
