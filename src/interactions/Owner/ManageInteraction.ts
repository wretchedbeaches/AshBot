import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export default {
	name: 'managecommands',
	description: 'Administrative command management.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'list',
			description: 'Show a list of all commands.',
			options: [
				{ type: 3, name: 'category', description: 'List commands for the specified category.', required: false },
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'update',
			description: 'Update a command to the API.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'command',
					description: 'The command name (by internal id) to update.',
					required: true,
				},
			],
		},
	],
	default_permission: false,
} as const;
