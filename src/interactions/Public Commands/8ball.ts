import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export default {
	name: '8ball',
	description: 'Let the bot decide your future',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'question',
			description: 'What would you like to ask the 8ball?',
			required: false,
		},
	],
	default_permission: true,
} as const;
