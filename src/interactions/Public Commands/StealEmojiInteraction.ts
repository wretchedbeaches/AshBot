import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export default {
	name: 'stealemoji',
	description: "To steal emoji's from any server",
	options: [
		{ type: ApplicationCommandOptionType.String, name: 'emoji', description: 'The emoji to steal.', required: true },
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name to give the emoji',
			required: false,
		},
	],
	default_permission: true,
} as const;
