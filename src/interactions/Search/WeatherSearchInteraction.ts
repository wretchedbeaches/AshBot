import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export default {
	name: 'weathersearch',
	description: 'Search for weather by type or by coordinate.',
	options: [
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'weather',
			description: 'The weather to search for',
			required: false,
			choices: [
				{ name: 'sunny', value: 1 },
				{ name: 'rain', value: 2 },
				{ name: 'partly cloudy', value: 3 },
				{ name: 'cloudy', value: 4 },
				{ name: 'windy', value: 5 },
				{ name: 'snow', value: 6 },
				{ name: 'fog', value: 7 },
			],
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'city',
			description: 'The city to search within',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'latitude',
			description: 'The latitude to search from',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'longitude',
			description: 'The longitude to search from',
			required: false,
		},
	],
	default_permission: true,
} as const;
