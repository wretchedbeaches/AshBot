import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { ChannelTypes } from 'discord.js/typings/enums';
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
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'command-restriction',
			description: 'Set a channel restriction for a command',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'commandName',
					description: 'The name of the command to set the restriction for',
					required: true,
				},
				{
					type: ApplicationCommandOptionType.Channel,
					name: 'channel',
					description: 'The channel to restrict the command to',
					required: false,
					channel_types: [ChannelTypes.GUILD_TEXT],
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'removeRestriction',
					description: 'Set to true to remove the specified channel restriction',
					required: false,
				},
			],
		},
	],
	default_permission: false,
} as const;
