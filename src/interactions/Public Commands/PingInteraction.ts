import COMMAND_NAMES from '../../util/CommandNames';

export default {
	name: COMMAND_NAMES.PUBLIC.PING,
	description: 'Check the latency of the ping to the Discord API',
	options: [],
	default_permission: true,
} as const;
