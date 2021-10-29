import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import COMMAND_NAMES from '../../util/CommandNames';
import { latitudeLongitudeCitySearchOptions } from '../Base/CommonOptions';

export default {
	name: COMMAND_NAMES.SEARCH.WEATHER,
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
		...latitudeLongitudeCitySearchOptions,
	],
	default_permission: true,
} as const;
