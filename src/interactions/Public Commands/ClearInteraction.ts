import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export default {
	name: 'clear',
	description: 'Deletes a specific number of messages.',
	options: [
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'amount',
			description: 'The number of messages to delete.',
			required: true,
		},
	],
	default_permission: true,
} as const;
