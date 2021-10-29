import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import COMMAND_NAMES from '../../util/CommandNames';

export default {
	name: COMMAND_NAMES.CONFIGURATION.ADMIN,
	description: 'Access admin commands.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'roles',
			description: 'Manage the admin, moderator, or mute roles.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'type',
					description: 'The role type to manage: admin | mod | mute',
					required: true,
					choices: [
						{ name: 'admin', value: 'admin' },
						{ name: 'mod', value: 'mod' },
						{ name: 'mute', value: 'mute' },
					],
				},
				{ type: ApplicationCommandOptionType.Role, name: 'role', description: 'The role to use', required: true },
			],
		},
	],
	default_permission: false,
} as const;
