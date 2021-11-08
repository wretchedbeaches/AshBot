import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import COMMAND_NAMES from '../../util/CommandNames';

export default {
	name: COMMAND_NAMES.PUBLIC.DISTANCE,
	description: 'Check the distance and associated softban cooldown time between two points.',
	options: [
		{
			type: ApplicationCommandOptionType.Number,
			name: 'from_latitude',
			description: 'The latitude to get cooldown time from',
			required: true,
			min_value: -90,
			max_value: -90,
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'from_longiutde',
			description: 'The longitude to get cooldown time from',
			required: true,
			min_value: -180,
			max_value: 180,
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'to_latitude',
			description: 'The latitude to get cooldown time to',
			required: true,
			min_value: -90,
			max_value: -90,
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'to_longitude',
			description: 'The longitude to get cooldown time to',
			required: true,
			min_value: -180,
			max_value: 180,
		},
	],
	default_permission: true,
} as const;
