import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import COMMAND_NAMES from '../../util/CommandNames';

export default {
	name: COMMAND_NAMES.SEARCH.NEST,
	description: 'Search for nests by pokemon name.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name of the pokemon to search by',
			required: true,
		},
	],
	default_permission: true,
} as const;
