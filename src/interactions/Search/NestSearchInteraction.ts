import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export default {
	name: 'nestsearch',
	description: 'Search for nests by pokemon name.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name of the pokemon to search by',
			required: false,
		},
	],
	default_permission: true,
} as const;
