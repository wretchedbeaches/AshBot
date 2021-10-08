import { CommandInteraction } from 'discord.js';
import ntim from '../../../util/name_to_id_map.json';
import { stripIndents } from 'common-tags';
import Command from '../../../struct/commands/Command';
import {
	addCpFilterOptions,
	addGeofilterOptions,
	addLevelFilterOptions,
	parseGeofilterOptions,
} from '../../../util/WebhookFilterOptions';
import { RaidsetConfig } from '../../../models/WebhookConfigurations';

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
		// TODO: once https://github.com/discordjs/builders/pull/41 is merged
		// Only allow for only text channels to be selected for this argument.
		const channel = interaction.options.getChannel('channel', false) ?? interaction.channel;
		const guildId = interaction.guildId;
		// TODO: Remove this check once command is forced to be guild only.
		if (guildId == null || channel === null) {
			return interaction.editReply(
				`No channel was provided for the Raid Webhook Configuration and the command was not used in a channel.`,
			);
		}
		const channelId = channel.id;
		const channelConfigurations = this.client.settings.get(guildId, 'channels', {});
		// If set to update and the configuration already exists, update it.
		const channelConfiguration: RaidsetConfig =
			isUpdate && channelConfigurations[channelId] !== undefined ? channelConfigurations[channelId] : { type: 'raid' };

		const filterErrorSuffix = isUpdate ? 'updated' : 'set';
		let error = parseGeofilterOptions(interaction, channelConfiguration, filterErrorSuffix);

		const pokemonNameArgument = interaction.options.getString('name', false);
		if (pokemonNameArgument !== null) {
			const pokemonId = ntim[pokemonNameArgument];
			if (pokemonId) {
				channelConfiguration.name = pokemonNameArgument.toLowerCase();
			} else {
				error += `\n\nThe pokemon name '${pokemonNameArgument}' was provided but could not be found, the name filter was not ${filterErrorSuffix}.`;
			}
		}

		const argumentBlacklist = ['channel', 'radius', 'city', 'latitude', 'longitude', 'name', 'unit', 'update'];
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
		this.client.trains.delete(channelId);
		const finalError = error === '' ? '' : ` However the following errors occurred:\n\n${error.trim()}`;
		return interaction.editReply(`Successfully updated channel's raid webhook configuration.${finalError}`);
	}
}
