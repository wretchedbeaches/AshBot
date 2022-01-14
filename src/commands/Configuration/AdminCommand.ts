/* eslint-disable @typescript-eslint/no-base-to-string */
import { CommandInteraction, GuildTextBasedChannel } from 'discord.js';
import Command from '../../struct/commands/Command';
import COMMAND_NAMES from '../../util/CommandNames';

// TODO: Need to setup Command Permissions stuff.
export default class AdminCommand extends Command {
	public constructor() {
		super(COMMAND_NAMES.CONFIGURATION.ADMIN, {
			category: 'Configuration',
			description: {
				content: 'Access admin commands.',
				usage: 'admin <command> [options]',
				examples: ['admin roles admin <role>', 'admin roles mod <role>'],
			},
			rateLimit: 3,
			ownerOnly: true,
		});
	}

	public async execute(interaction: CommandInteraction) {
		const subcommand = interaction.options.getSubcommand(true);
		switch (subcommand) {
			case 'roles':
				return this.handleRoles(interaction);
			case 'commands':
				return this.handleCommands(interaction);
		}
	}

	private async handleRoles(interaction: CommandInteraction) {
		const roleType = interaction.options.getString('type', true);
		const role = interaction.options.getRole('role', true);
		await this.client.settings.set(interaction.guild!.id, `${roleType}RoleId`, role.id);
		return interaction.editReply(`Successfully set ${roleType} role to ${role.name}`);
	}

	private async handleCommands(interaction: CommandInteraction) {
		const commandName = interaction.options.getString('commandName', true);
		const channelToRestrict = interaction.options.getChannel('channel', false) as GuildTextBasedChannel | null;
		const removeChannel = interaction.options.getBoolean('removeRestriction', false) ?? false;
		const command = interaction.guild?.commands.cache.find(
			(value) => value.name.toLowerCase() === commandName.toLowerCase(),
		);

		if (!command) {
			return interaction.editReply(`No command found by the name '${commandName}'`);
		}

		if (removeChannel || channelToRestrict === null) {
			return this.client.channelRestrictions
				.removeChannelRestriction(interaction.guildId!, commandName)
				.then(() => interaction.editReply(`The '${command.name}' command is no longer restricted to a channel`))
				.catch((error) =>
					interaction.editReply(
						`An error occurred trying to remove the channel restriction for '${command.name}' command:\n\n${
							error as string
						}`,
					),
				);
		}

		const existingRestriction = this.client.channelRestrictions.get(interaction.guildId!, commandName);
		if (existingRestriction === channelToRestrict.id) {
			return interaction.editReply(
				`The '${command.name} command is already restricted to the channel ${channelToRestrict.toString()}`,
			);
		}

		return this.client.channelRestrictions
			.addChannelRestriction(interaction.guildId!, commandName, channelToRestrict)
			.then(() => {
				return interaction.editReply(
					`Successfully restrivted the use of '${command.name}' command to ${channelToRestrict.toString()}`,
				);
			})
			.catch((error) =>
				interaction.editReply(
					`An error occurred trying to restrict the use of '${
						command.name
					}' command in ${channelToRestrict.toString()}:\n\n${error as string}`,
				),
			);
	}
}
