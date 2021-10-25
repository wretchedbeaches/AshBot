import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export default {
	name: 'rank',
	description: 'Search for PVP ranks by league and pokemon.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name of the pokemon to search by',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'league',
			description: 'The league to search by',
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
