import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import COMMAND_NAMES from '../../util/CommandNames';

export default {
	name: COMMAND_NAMES.PUBLIC.WHO_IS,
	description: 'Gets info about a member.',
	options: [
		{
			type: ApplicationCommandOptionType.User,
			name: 'member',
			description: 'The member to get info for.',
			required: true,
		},
	],
	default_permission: true,
} as const;
