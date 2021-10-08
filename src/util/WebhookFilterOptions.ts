import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import config from '../config.json';

export const parseGeofilterOptions = (interaction: CommandInteraction, channelConfiguration, errorSuffix: string) => {
	let error = '';
	const cityArgument = interaction.options.getString('city', false);
	// If a city is provided it shall take priority.
	if (cityArgument === null) {
		const radiusArgument = interaction.options.getNumber('radius', false);
		const latitudeArgument = interaction.options.getNumber('latitude', false);
		const longitudeArgument = interaction.options.getNumber('longitude', false);
		const hasLatLong = latitudeArgument && longitudeArgument;

		const attemptedToSetGeofilter =
			radiusArgument !== null && (latitudeArgument !== null || longitudeArgument !== null);
		if (radiusArgument !== null) {
			const unitArgument = interaction.options.getString('unit') as 'km' | 'm' | null;
			if (unitArgument === null) {
				error = `A radius of '${radiusArgument}' was provided without a unit (m or km), geofilter was not ${errorSuffix}.`;
			} else if (hasLatLong) {
				channelConfiguration.geofilter = {
					center: [latitudeArgument, longitudeArgument!],
					radius: radiusArgument,
					unit: unitArgument,
				};
			}
		} else if (attemptedToSetGeofilter) {
			error = `The following arguments were provided for the geo filter:`;
			error += `\nlat/long: '${latitudeArgument ?? ''}/${longitudeArgument ?? ''}'`;
			error += `\n\n**But no radius was provided and is required when providing a lat/long.**\nGeofilter was not ${errorSuffix}`;
		}
	} else if (config.cities[cityArgument.toLowerCase()]) {
		channelConfiguration.geofilter = cityArgument.toLowerCase();
	} else {
		error = `City '${cityArgument}' was provided but could not be found, geofilter was not ${errorSuffix}.`;
	}
	return error;
};

export const addGeofilterOptions = (command: SlashCommandBuilder | SlashCommandSubcommandBuilder) => {
	command
		.addNumberOption((latitudeOption) =>
			latitudeOption.setName('latitude').setDescription('The latitude to filter on with radius.'),
		)
		.addNumberOption((longitudeOption) =>
			longitudeOption.setName('longitude').setDescription('The longitude to filter on with radius.'),
		)
		.addNumberOption((radiusOption) =>
			radiusOption
				.setName('radius')
				.setDescription(
					'The radius (in km or m based on server configuration) to filter on from the given city or lat/long.',
				),
		)
		.addStringOption((unitOption) =>
			unitOption
				.setName('unit')
				.setDescription('Radius metric: km (kilometres) | m (miles).')
				.addChoices([
					['m', 'm'],
					['km', 'km'],
				]),
		)
		.addStringOption((cityOption) => cityOption.setName('city').setDescription('The city to filter on.'));
	return command;
};

export const addCpFilterOptions = (command: SlashCommandBuilder | SlashCommandSubcommandBuilder) => {
	command
		.addIntegerOption((mincpOption) => mincpOption.setName('mincp').setDescription('The minimum cp to filter on.'))
		.addIntegerOption((maxcpOption) => maxcpOption.setName('maxcp').setDescription('The maximum cp to filter on.'));
	return command;
};

export const addLevelFilterOptions = (command: SlashCommandBuilder | SlashCommandSubcommandBuilder) => {
	command
		.addIntegerOption((minLevelOption) =>
			minLevelOption.setName('minlevel').setDescription('The minimum level to filter on.'),
		)
		.addIntegerOption((maxLevelOption) =>
			maxLevelOption.setName('maxlevel').setDescription('The maximum level to filter on.'),
		);
	return command;
};
