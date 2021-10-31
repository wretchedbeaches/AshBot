import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import COMMAND_NAMES from '../../../util/CommandNames';
import { commonHookOptions } from '../../Base/CommonOptions';

export default {
	name: COMMAND_NAMES.CONFIGURATION.WEBHOOKS.POKEMON,
	description: 'Set or remove the pokemon webhook configuration for a particular channel.',
	options: [
		...commonHookOptions,
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'boosted',
			description: 'Whether to filter on boosted',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'miniv',
			description: 'The mnimimum IV to filter on',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'maxiv',
			description: 'The maximum IV to filter on',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'mincp',
			description: 'The minimum cp to filter on',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'maxcp',
			description: 'The maximum cp to filter on',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'minlevel',
			description: 'The minimum level to filter on',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'maxlevel',
			description: 'The maximum level to filter on',
			required: false,
		},
		{ type: 5, name: 'train', description: 'Whether or not to filter on train', required: false },
		{
			type: ApplicationCommandOptionType.String,
			name: 'rmpokemon',
			description: 'Pokemon to remove from the filter, update must be true.',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'names',
			description: 'Comma separated Pokemon names to filter on.',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'atkiv',
			description: 'The atk IV to filter on',
			required: false,
			choices: [
				{ name: '0', value: 0 },
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
			],
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'defiv',
			description: 'The def IV to filter on',
			required: false,
			choices: [
				{ name: '0', value: 0 },
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
			],
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'staiv',
			description: 'The sta IV to filter on',
			required: false,
			choices: [
				{ name: '0', value: 0 },
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
				{ name: '7', value: 7 },
				{ name: '8', value: 8 },
				{ name: '9', value: 9 },
				{ name: '10', value: 10 },
				{ name: '11', value: 11 },
				{ name: '12', value: 12 },
				{ name: '13', value: 13 },
				{ name: '14', value: 14 },
				{ name: '15', value: 15 },
			],
		},
	],
	default_permission: false,
} as const;