import COMMAND_NAMES from '../../util/CommandNames';

export default {
	name: COMMAND_NAMES.PUBLIC.SERVER_INFO,
	description: 'Gets info about a server',
	options: [],
	default_permission: true,
} as const;
