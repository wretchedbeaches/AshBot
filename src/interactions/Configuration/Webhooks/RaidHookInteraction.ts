import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { ChannelTypes } from 'discord.js/typings/enums';

export default {
	name: 'raidset',
	description: 'Set or update the raid webhook configuration for a particular channel.',
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
			name: 'ex',
			description: 'Whether to filter on ex raid.',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'team',
			description: 'The team to filter on.',
			required: false,
			choices: [
				{ name: 'Uncontested', value: 0 },
				{ name: 'Mystic', value: 1 },
				{ name: 'Valor', value: 2 },
				{ name: 'Instinct', value: 3 },
			],
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name of a pokemon to filter on.',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'mincp',
			description: 'The minimum cp to filter on',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'maxcp',
			description: 'The maximum cp to filter on',
			required: false,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'minlevel',
			description: 'The minimum level to filter on',
			required: false,
			choices: [
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
			],
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'maxlevel',
			description: 'The maximum level to filter on',
			required: false,
			choices: [
				{ name: '1', value: 1 },
				{ name: '2', value: 2 },
				{ name: '3', value: 3 },
				{ name: '4', value: 4 },
				{ name: '5', value: 5 },
				{ name: '6', value: 6 },
			],
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
