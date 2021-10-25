import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export default {
	name: 'nest',
	description: 'Retrieves a list of the current nesting pokemon.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'type',
			description: 'Whether to list by global (default, shows all), worldwide, northern or southern.',
			required: false,
			choices: [
				{ name: 'global', value: 'global' },
				{ name: 'worldwide', value: 'worldwide' },
				{ name: 'north', value: 'north' },
				{ name: 'south', value: 'south' },
			],
		},
	],
	default_permission: true,
} as const;
