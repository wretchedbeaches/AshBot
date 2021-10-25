import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export default {
	name: 'help',
	description: 'View available commands on the bot',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'command',
			description: 'The command to get help for.',
			required: false,
		},
	],
	default_permission: true,
} as const;
