import { Listener } from 'discord-akairo';
import { TextChannel } from 'discord.js';

export default class ChannelDeleteListener extends Listener {
  public constructor() {
    super('channelDelete', {
      emitter: 'client',
      event: 'channelDelete',
      category: 'client',
    });
  }

  public exec(channel: TextChannel): void {
    const channels = this.client.settings.get(channel.guild.id, 'channels', {});
    if (channels[channel.id]) delete channels[channel.id];
    this.client.settings.set(channel.guild.id, 'channels', channels);
  }
}