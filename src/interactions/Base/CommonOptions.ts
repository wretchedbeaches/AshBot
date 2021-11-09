import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { ChannelTypes } from 'discord.js/typings/enums';

export const getLatLongOptions = (description: string, replace = 'X') => {
	return [
		{
			type: ApplicationCommandOptionType.Number,
			name: 'latitude',
			description: `${description.replace(replace, 'latitude')} (min: -90, max: 90)`,
			required: false,
			min_value: -90,
			max_value: 90,
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'longitude',
			description: `${description.replace(replace, 'longitude')} (min: -180, max: 180)`,
			required: false,
			min_value: -180,
			max_value: 180,
		},
	];
};

export const latitudeLongitudeCitySearchOptions = [
	...getLatLongOptions('The X to search from'),
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

export const commonCpOptions = [
	{
		type: ApplicationCommandOptionType.Integer,
		name: 'mincp',
		description: 'The minimum cp to filter on (min: 0, max: 4000)',
		required: false,
		min_value: 0,
		max_value: 4000,
	},
	{
		type: ApplicationCommandOptionType.Integer,
		name: 'maxcp',
		description: 'The maximum cp to filter on (min: 0, max: 4000)',
		required: false,
		min_value: 0,
		max_value: 4000,
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
	...getLatLongOptions('The X to filter on with radius'),
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
