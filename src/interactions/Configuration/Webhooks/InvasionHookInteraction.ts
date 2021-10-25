import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { ChannelTypes } from 'discord.js/typings/enums';

export default {
	name: 'invasionset',
	description: 'Set or remove the invasion webhook configuration for a particular channel.',
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
			type: ApplicationCommandOptionType.Boolean,
			name: 'leader',
			description: 'Whether or not to filter on leaders.',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'train',
			description: 'Whether or not to filter on train',
			required: false,
		},
	],
	default_permission: false,
} as const;
