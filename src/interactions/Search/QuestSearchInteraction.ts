import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { latitudeLongitudeCitySearchOptions, unitAndDistanceSearchOptions } from '../Base/CommonOptions';

export default {
	name: 'quest',
	description: 'Search for quests by reward type.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'pokemon',
			description: 'Search for quest by Pokemon reward type',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The name of the pokemon to search by',
					required: true,
				},
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
				{
					type: ApplicationCommandOptionType.String,
					name: 'city',
					description: 'The city to search within',
					required: false,
				},
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
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'item',
			description: 'Search quest by item reward type',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The name of the item to search by',
					required: false,
				},
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
				{
					type: ApplicationCommandOptionType.String,
					name: 'city',
					description: 'The city to search within',
					required: false,
				},
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
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'stardust',
			description: 'Search quest by stardust reward type',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'amount',
					description: 'The amount of stardust',
					required: false,
				},
				...unitAndDistanceSearchOptions,
				...latitudeLongitudeCitySearchOptions,
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'mega',
			description: 'Search quest by mega energy reward type',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'name',
					description: 'The name of the Pokemon mega energy',
					required: false,
				},
				...unitAndDistanceSearchOptions,
				...latitudeLongitudeCitySearchOptions,
			],
		},
	],
	default_permission: true,
} as const;
