import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { ChannelTypes } from 'discord.js/typings/enums';

export const latitudeLongitudeCitySearchOptions = [
	{
		type: ApplicationCommandOptionType.Number,
		name: 'latitude',
		description: 'The latitude to search from',
		required: false,
	},
	{
		type: ApplicationCommandOptionType.Number,
		name: 'longitude',
		description: 'The longitude to search from',
		required: false,
	},
	{
		type: ApplicationCommandOptionType.String,
		name: 'city',
		description: 'The city to search within',
		required: false,
	},
] as const;

export const unitAndDistanceSearchOptions = [
	{
		type: ApplicationCommandOptionType.Integer,
		name: 'distance',
		description: 'The radius to search, defaults to km (see unit)',
		required: false,
	},
	{
		type: ApplicationCommandOptionType.String,
		name: 'unit',
		description: 'The metric of the distance, metres or kilometres',
		required: false,
	},
];

export const commonHookOptions = [
	{
		type: ApplicationCommandOptionType.Channel,
		name: 'channel',
		description: 'The channel to create the raid webhook for',
		required: false,
		channel_types: [ChannelTypes.GUILD_TEXT],
	},
	{
		type: ApplicationCommandOptionType.Boolean,
		name: 'update',
		description: 'If true, existing config will be updated instead of overwritten',
		required: false,
	},
	{
		type: ApplicationCommandOptionType.Number,
		name: 'latitude',
		description: 'The latitude to filter on with radius',
		required: false,
	},
	{
		type: ApplicationCommandOptionType.Number,
		name: 'longitude',
		description: 'The longitude to filter on with radius',
		required: false,
	},
	{
		type: ApplicationCommandOptionType.Number,
		name: 'radius',
		description: 'The radius (default 10km) to filter on from the given city or lat/long',
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
] as const;
