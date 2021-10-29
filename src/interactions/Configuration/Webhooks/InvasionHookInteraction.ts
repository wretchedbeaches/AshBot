import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import COMMAND_NAMES from '../../../util/CommandNames';
import { commonHookOptions } from '../../Base/CommonOptions';

export default {
	name: COMMAND_NAMES.CONFIGURATION.WEBHOOKS.INVASION,
	description: 'Set or remove the invasion webhook configuration for a particular channel.',
	options: [
		...commonHookOptions,
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'leader',
			description: 'Whether or not to filter on leaders.',
			required: false,
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
