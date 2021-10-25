import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export default {
	name: 'distance',
	description: 'Check the distance and associated softban cooldown time between two points.',
	options: [
		{
			type: ApplicationCommandOptionType.Number,
			name: 'from_latitude',
			description: 'The from latitude.',
			required: true,
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'from_longiutde',
			description: 'The from longitude.',
			required: true,
		},
		{ type: ApplicationCommandOptionType.Number, name: 'to_latitude', description: 'The to latitude.', required: true },
		{
			type: ApplicationCommandOptionType.Number,
			name: 'to_longitude',
			description: 'The to longitude.',
			required: true,
		},
	],
	default_permission: true,
} as const;
