import { APIMessage } from 'discord-api-types/v9';
import { CommandInteraction, Message } from 'discord.js';
import Command from '../../struct/commands/Command';

// TODO: Need to setup Command Permissions stuff.
export default class AdminCommand extends Command {
	public constructor() {
		super('admin', {
			category: 'Configuration',
			description: {
				content: 'Access admin commands.',
				usage: 'admin <command> [options]',
				examples: ['admin roles admin <role>', 'admin roles mod <role>'],
			},
			rateLimit: 3,
		});
		this.data.addSubcommand((subcommand) =>
			subcommand
				.setName('roles')
				.setDescription('Manage the admin, moderator, or mute roles.')
				.addStringOption((option) =>
					option
						.setName('type')
						.setDescription('The role type to manage: admin | mod | mute')
						.addChoices([
							['admin', 'admin'],
							['mod', 'mod'],
							['mute', 'mute'],
						])
						.setRequired(true),
				)
				.addRoleOption((option) => option.setName('role').setDescription('The role to use').setRequired(true)),
		);
	}

	public async execute(interaction: CommandInteraction): Promise<Message | APIMessage> {
		const roleType = interaction.options.getString('type', true);
		const role = interaction.options.getRole('role', true);
		await this.client.settings.set(interaction.guild!.id, `${roleType}RoleId`, role.id);
		return interaction.editReply(`Successfully set ${roleType} role to ${role.name}`) as Promise<Message | APIMessage>;
	}
}
