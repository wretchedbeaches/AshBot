import COMMAND_NAMES from '../../util/CommandNames';

export default {
	name: COMMAND_NAMES.PUBLIC.STATS,
	description: 'Displays statistics about the bot.',
	options: [],
	default_permission: true,
} as const;
