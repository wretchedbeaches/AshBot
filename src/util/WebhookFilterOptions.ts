import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';

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
