import { CommandInteraction } from 'discord.js';
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
		const roleType = interaction.options.getString('type', true);
		const role = interaction.options.getRole('role', true);
		await this.client.settings.set(interaction.guild!.id, `${roleType}RoleId`, role.id);
		return interaction.editReply(`Successfully set ${roleType} role to ${role.name}`);
	}
}
