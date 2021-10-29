import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { ChannelTypes } from 'discord.js/typings/enums';

export default {
	name: 'webhooks',
	description: 'Show or remove Webhook Configurations.',
	options: [
		{
			type: 1,
			name: 'show',
			description: 'Show Webhook Configuration.',
			options: [
				{
					type: 7,
					name: 'channel',
					description: 'The channel to view configuration for, otherwise all of them.',
					required: false,
					channel_types: [0],
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'remove',
			description: 'Remove a Webhook Configuration.',
			options: [
				{
					type: ApplicationCommandOptionType.Channel,
					name: 'channel',
					description: 'The channel to remove configuration for.',
					required: true,
					channel_types: [ChannelTypes.GUILD_TEXT],
				},
			],
		},
	],
	default_permission: false,
} as const;
