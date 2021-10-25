import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export default {
	name: 'weather2',
	description: 'Search for the weather at a particular location using the Open Weather Map API.',
	options: [
		{ type: ApplicationCommandOptionType.String, name: 'city', description: 'The city to search by', required: false },
		{
			type: ApplicationCommandOptionType.Number,
			name: 'latitude',
			description: 'The latitude to search by',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'longitude',
			description: 'The longitude to search by',
			required: false,
		},
	],
	default_permission: true,
} as const;
