import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { ChannelTypes } from 'discord.js/typings/enums';

export default {
	name: 'sendembed',
	description: 'Send an embed to a specific channel.',
	options: [
		{
			type: ApplicationCommandOptionType.Channel,
			name: 'channel',
			description: 'The channel to send the embed to.',
			required: true,
			channel_types: [ChannelTypes.GUILD_TEXT],
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'content',
			description: 'The content to send in the embed.',
			required: true,
		},
	],
	default_permission: true,
} as const;
