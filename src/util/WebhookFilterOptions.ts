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
					'The radius (in km or m based on server configuration) to filter on from the given city or lat/long',
				),
		)
		.addStringOption((unitOption) =>
			unitOption
				.setName('unit')
				.setDescription('Radius metric: km (kilometres) | m (miles)')
				.addChoices([
					['m', 'm'],
					['km', 'km'],
				]),
		)
		.addStringOption((cityOption) => cityOption.setName('city').setDescription('The city to filter on'));
	return command;
};

export const addCpFilterOptions = (command: SlashCommandBuilder | SlashCommandSubcommandBuilder) => {
	command
		.addIntegerOption((mincpOption) => mincpOption.setName('mincp').setDescription('The minimum cp to filter on'))
		.addIntegerOption((maxcpOption) => maxcpOption.setName('maxcp').setDescription('The maximum cp to filter on'));
	return command;
};

export const getNumberChoices = (max: number) => {
	const ivChoices: [string, number][] = [];
	for (let i = 1; i <= max; i++) {
		ivChoices.push([`${i}`, i]);
	}
	return ivChoices;
};

export const addLevelFilterOptions = (
	command: SlashCommandBuilder | SlashCommandSubcommandBuilder,
	maxLevel: number | null = null,
) => {
	const levelChoices = maxLevel === null || maxLevel > 25 ? null : getNumberChoices(maxLevel);
	command
		.addIntegerOption((minLevelOption) => {
			minLevelOption.setName('minlevel').setDescription('The minimum level to filter on');
			if (levelChoices !== null) minLevelOption.addChoices(levelChoices);
			return minLevelOption;
		})
		.addIntegerOption((maxLevelOption) => {
			maxLevelOption.setName('maxlevel').setDescription('The maximum level to filter on');
			if (levelChoices !== null) maxLevelOption.addChoices(levelChoices);
			return maxLevelOption;
		});
	return command;
};

export const addIvFilterOptions = (command: SlashCommandBuilder | SlashCommandSubcommandBuilder) => {
	const ivChoices = getNumberChoices(15);
	command
		.addIntegerOption((minivOption) =>
			minivOption.setName('miniv').setDescription('The mnimimum IV to filter on').addChoices(ivChoices),
		)
		.addIntegerOption((maxivOption) =>
			maxivOption.setName('maxiv').setDescription('The maximum IV to filter on').addChoices(ivChoices),
		);
	return command;
};

export const addTrainFilterOption = (command: SlashCommandBuilder | SlashCommandSubcommandBuilder) => {
	command.addBooleanOption((trainOption) =>
		trainOption.setName('train').setDescription('Whether or not to filter on train'),
	);
};

// These are common to both Poke and Raid webhooks.
export const addCommonFilterOptions = (command: SlashCommandBuilder | SlashCommandSubcommandBuilder) => {
	command.addBooleanOption((boostedOption) =>
		boostedOption.setName('boosted').setDescription('Whether to filter on boosted'),
	);
	addIvFilterOptions(command);
	addCpFilterOptions(command);
	addLevelFilterOptions(command);
	addTrainFilterOption(command);
};
