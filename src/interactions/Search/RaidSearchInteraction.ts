import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import COMMAND_NAMES from '../../util/CommandNames';
import { latitudeLongitudeCitySearchOptions, unitAndDistanceSearchOptions } from '../Base/CommonOptions';

export default {
	name: COMMAND_NAMES.SEARCH.RAID,
	description: 'Search for raids.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name of the pokemon to search by',
			required: true,
		},
		...unitAndDistanceSearchOptions,
		...latitudeLongitudeCitySearchOptions,
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'ex',
			description: 'Whether to search for ex raids',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'team',
			description: 'Search for raids on the specified team',
			required: false,
			choices: [
				{ name: 'uncontested', value: 'uncontested' },
				{ name: 'mystic', value: 'mystic' },
				{ name: 'valor', value: 'valor' },
				{ name: 'instinct', value: 'instinct' },
				{ name: 'any', value: 'any' },
			],
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'level',
			description: 'Search for raids of a particular level',
			required: false,
			min_value: 1,
			max_value: 6,
		},
	],
	default_permission: true,
} as const;
