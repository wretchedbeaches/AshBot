import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import COMMAND_NAMES from '../../util/CommandNames';

export default {
	name: COMMAND_NAMES.SEARCH.RANK,
	description: 'Search for PVP ranks by league and pokemon.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name of the pokemon to search by',
			required: true,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'league',
			description: 'The league to search by (default: great)',
			required: false,
			choices: [
				{ name: 'great', value: 1500 },
				{ name: 'ultra', value: 2500 },
				{ name: 'master', value: 10000 },
			],
		},
	],
	default_permission: true,
} as const;
