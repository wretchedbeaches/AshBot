import { CommandInteraction } from 'discord.js';
import Command, { CommandOptions } from '../struct/commands/Command';

// TODO: Need to setup Command Permissions stuff.
export default class BaseChannelRestrictedCommand extends Command {
	public constructor(id: string, options: CommandOptions) {
		super(id, options);
	}

	public shouldExecute(interaction: CommandInteraction): boolean {
		const channelRestriction = this.client.channelRestrictions.get(interaction.guildId!, interaction.commandName);

		if (channelRestriction) {
			const commandRestrictedChannel = channelRestriction.channel;
			if (commandRestrictedChannel && commandRestrictedChannel !== interaction.channelId) {
				void interaction.reply({
					ephemeral: true,
					content: `This command can only be used in <${
						(commandRestrictedChannel as string | undefined) ?? 'unknown'
					}>`,
				});
				return false;
			}
		}

		return true;
	}
}
