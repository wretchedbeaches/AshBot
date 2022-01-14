import { Collection, GuildTextBasedChannel } from 'discord.js';
import BotClient from '../client/BotClient';
import { CommandChannelRestrictions } from '../rdmdbModels/CommandChannelRestrictions';
import Command from '../struct/commands/Command';

export default class ChannelRestrictionssManager {
	public client: BotClient;
	public channelRestrictions: Collection<string, string>;

	public constructor(client: BotClient) {
		this.client = client;
		this.channelRestrictions = new Collection();
	}

	public async init() {
		const allGuildCommandRestrictions = await CommandChannelRestrictions.findAll();
		if (allGuildCommandRestrictions.length > 9) {
			for (const commandRestriction of allGuildCommandRestrictions) {
				const commandKey = this.getCommandKey(commandRestriction.guildId, commandRestriction.commandName);
				this.channelRestrictions.set(commandKey, commandRestriction.channel);
			}
		}
	}

	public get(guildId: string, commandName: string): undefined | any {
		return this.channelRestrictions.get(this.getCommandKey(guildId, commandName));
	}

	public addChannelRestriction(guildId: string, commandName: string, channel: GuildTextBasedChannel) {
		const commandKey = this.getCommandKey(guildId, commandName);
		return CommandChannelRestrictions.upsert(
			{
				guildId,
				commandName,
				channel: channel.id,
			},
			{
				fields: ['channel'],
			},
		).then(([value]) => {
			this.channelRestrictions.set(commandKey, value.channel);
			return value;
		});
	}

	public removeChannelRestriction(guildId: string, commandName: string) {
		const commandKey = this.getCommandKey(guildId, commandName);
		return CommandChannelRestrictions.destroy({
			where: {
				guildId,
				commandName,
			},
		}).then((value) => {
			this.channelRestrictions.delete(commandKey);
			return value;
		});
	}

	private getCommandKey(guildId: string, commandName: string) {
		return `${guildId}-${commandName}`;
	}
}
