import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import COMMAND_NAMES from '../../../util/CommandNames';
import { commonHookOptions } from '../../Base/CommonOptions';

export default {
	name: COMMAND_NAMES.CONFIGURATION.WEBHOOKS.RAID,
	description: 'Set or update the raid webhook configuration for a particular channel.',
	options: [
		...commonHookOptions,
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'ex',
			description: 'Whether to filter on ex raid.',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'team',
			description: 'The team to filter on.',
			required: false,
			choices: [
				{ name: 'Uncontested', value: 0 },
				{ name: 'Mystic', value: 1 },
				{ name: 'Valor', value: 2 },
				{ name: 'Instinct', value: 3 },
			],
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name of a pokemon to filter on.',
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
			choices: [
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
			],
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'maxlevel',
			description: 'The maximum level to filter on',
			required: false,
			choices: [
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
			],
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'train',
			description: 'Whether or not to filter on train',
			required: false,
		},
	],
	default_permission: false,
} as const;
