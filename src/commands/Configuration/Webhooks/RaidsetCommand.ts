import { CommandInteraction } from 'discord.js';
import ntim from '../../../util/name_to_id_map.json';
import config from '../../../config.json';
import { stripIndents } from 'common-tags';
import Command from '../../../struct/commands/Command';
import { addCpFilterOptions, addGeofilterOptions, addLevelFilterOptions } from '../../../util/WebhookFilterOptions';
import RaidOptions from '../../../models/RaidOptions';

export default class RaidsetCommand extends Command {
	public constructor() {
		super('raidset', {
			description: {
				content: 'Set or update the raid webhook configuration for a particular channel.',
				usage: stripIndents`raidset
                  ex \`true|false\`
                  team \`uncontested|mystic|valor|instinct\`
                  boosted \`true|false\`
                  name \`pokemon's name\`
                  geofilter \`distance(km/m) lattitude,longitude|city\`
                  miniv \`min iv\`
                  maxiv \`max iv\`
                  mincp \`min cp\`
                  maxcp \`max cp\`
                  minlevel \`min level\`
                  maxlevel \`max level\`
                  train`,
				examples: ['webhooks', 'webhooks #webhook-channel'],
			},
			category: 'Webhooks',
			ratelimit: 3,
		});

		this.data
			.addChannelOption((option) =>
				option.setName('channel').setDescription('The channel to create the raid webhook for.').setRequired(false),
			)
			.addBooleanOption((updateOption) =>
				updateOption
					.setName('update')
					.setDescription('If true, existing config will be updated instead of overwritten.'),
			)
			.addBooleanOption((exOption) => exOption.setName('ex').setDescription('Whether to filter on ex raid.'))
			.addStringOption((teamOption) =>
				teamOption
					.setName('team')
					.setDescription('The team to filter on.')
					.addChoices([
						['uncontested', 'uncontested'],
						['mystic', 'mystic'],
						['valor', 'valor'],
						['instinct', 'instinct'],
					]),
			)
			.addBooleanOption((boostedOption) =>
				boostedOption.setName('boosted').setDescription('Whether to filter on boosted'),
			)
			.addStringOption((pokemonNameOption) =>
				pokemonNameOption.setName('name').setDescription('The name of a pokemon to filter on.'),
			);
		addCpFilterOptions(this.data);
		addLevelFilterOptions(this.data).addBooleanOption((trainOption) =>
			trainOption.setName('train').setDescription('Whether to filter on train.'),
		);

		addGeofilterOptions(this.data);
	}

	public async execute(interaction: CommandInteraction) {
		// Create/overwrite by default if update argument is not provided.
		const isUpdate = interaction.options.getBoolean('update', false) ?? false;
		const guildId = interaction.guildId!;
		const channel = interaction.options.getChannel('channel', true);
		const channelId = channel.id;
		const channelConfigurations = this.client.settings.get(guildId, 'channels', {});
		// If set to update and the configuration already exists, update it.
		const channelConfiguration: RaidOptions =
			isUpdate && channelConfigurations[channelId] !== undefined ? channelConfigurations[channelId] : { type: 'raid' };

		let error = '';
		const radiusArgument = interaction.options.getNumber('radius', false);
		const cityArgument = interaction.options.getString('city', false);
		const latitudeArgument = interaction.options.getNumber('latitude', false);
		const longitudeArgument = interaction.options.getNumber('longitude', false);

		const hasCityArgument = cityArgument !== null;
		const hasLatLong = latitudeArgument && longitudeArgument;

		const filterErrorSuffix = isUpdate ? 'updated' : 'set';
		// This determines whether the user attempted to provide a geofilter but didn't provide a radius.
		// This logic doesn't entirely make sense, because previously a city is never really used in filtering....
		// TODO: Work out what the hell is meant to be going on - i'll double check the old raid filter logic.
		const attemptedToSetGeofilter =
			radiusArgument !== null && (latitudeArgument !== null || longitudeArgument !== null);
		if (hasCityArgument) {
			if (config.cities[cityArgument]) {
				channelConfiguration.geofilter = cityArgument;
			} else {
				error = `City '${cityArgument!}' was provided but could not be found, geofilter was not ${filterErrorSuffix}.`;
			}
		} else if (radiusArgument !== null) {
			const unitArgument = interaction.options.getString('unit') as 'km' | 'm' | null;
			if (unitArgument === null) {
				error = `A radius of '${radiusArgument}' was provided without a unit (m or km), geofilter was not ${filterErrorSuffix}.`;
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
			error += `\n\n**But no radius was provided and is required when providing a lat/long.**\nGeofilter was not ${filterErrorSuffix}`;
		}

		const pokemonNameArgument = interaction.options.getString('name', false);
		if (pokemonNameArgument !== null) {
			const pokemonId = ntim[pokemonNameArgument];
			if (pokemonId) {
				channelConfiguration.name = pokemonNameArgument.toLowerCase();
			} else {
				error += `\n\nThe pokemon name '${pokemonNameArgument}'' was provided but could not be found, the name filter was not ${filterErrorSuffix}.`;
			}
		}

		const argumentBlacklist = ['channel', 'radius', 'city', 'latitude', 'longitude', 'name', 'unit'];
		for (const argument of interaction.options.data) {
			if (argumentBlacklist.includes(argument.name)) continue;
			const argumentValue = argument.value ?? null;
			if (argumentValue !== null) channelConfiguration[argument.name] = argumentValue;
		}
		channelConfigurations[channelId] = channelConfiguration;
		if (this.client.intervals.has(channelId)) clearInterval(this.client.intervals.get(channelId)!);
		await this.client.settings.set(guildId, 'channels', channelConfigurations);
		this.client.embedQueue.set(channelId, []);
		this.client.setInterval(channelId);
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete this.client.trains[channelId];
		const finalError = error === '' ? '' : ` However the following errors occurred:\n\n${error.trim()}`;
		return interaction.editReply(`Successfully updated channel's raid webhook configuration.${finalError}`);
	}
}
