import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import COMMAND_NAMES from '../../util/CommandNames';

export default {
	name: COMMAND_NAMES.PUBLIC.CLEAR,
	description: 'Deletes a specific number of messages.',
	options: [
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'amount',
			description: 'The number of messages to delete.',
			required: true,
		},
	],
	default_permission: true,
} as const;
