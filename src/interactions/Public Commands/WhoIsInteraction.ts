import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export default {
	name: 'whois',
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
