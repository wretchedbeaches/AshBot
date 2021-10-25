import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { ChannelTypes } from 'discord.js/typings/enums';

export default {
	name: 'questset',
	description: 'Set or remove the quest webhook configuration for a particular channel',
	options: [
		{
			type: ApplicationCommandOptionType.Channel,
			name: 'channel',
			description: 'The channel to create the raid webhook for.',
			required: false,
			channel_types: [ChannelTypes.GUILD_TEXT],
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'update',
			description: 'If true, existing config will be updated instead of overwritten.',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'latitude',
			description: 'The latitude to filter on with radius.',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'longitude',
			description: 'The longitude to filter on with radius.',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'radius',
			description: 'The radius (in km or m based on server configuration) to filter on from the given city or lat/long',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'unit',
			description: 'Radius metric: km (kilometres) | m (miles)',
			required: false,
			choices: [
				{ name: 'm', value: 'm' },
				{ name: 'km', value: 'km' },
			],
		},
		{ type: ApplicationCommandOptionType.String, name: 'city', description: 'The city to filter on', required: false },
		{
			type: ApplicationCommandOptionType.String,
			name: 'reward',
			description: 'Filter quest webhooks by the specified reward type.',
			required: false,
			choices: [
				{ name: 'unset', value: 'unset' },
				{ name: 'experience', value: 'experience' },
				{ name: 'item', value: 'item' },
				{ name: 'stardust', value: 'stardust' },
				{ name: 'candy', value: 'candy' },
				{ name: 'avatar clothing', value: 'avatar clothing' },
				{ name: 'quest', value: 'quest' },
				{ name: 'pokemon encounter', value: 'pokemon encounter' },
				{ name: 'pokecoin', value: 'pokecoin' },
				{ name: 'xl candy', value: 'xl candy' },
				{ name: 'level cap', value: 'level cap' },
				{ name: 'sticker', value: 'sticker' },
				{ name: 'mega resource', value: 'mega resource' },
			],
		},
	],
	default_permission: false,
} as const;
