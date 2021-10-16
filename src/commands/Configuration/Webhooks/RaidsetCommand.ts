import { CommandInteraction } from 'discord.js';
import ntim from '../../../util/name_to_id_map.json';
import { stripIndents } from 'common-tags';
import { addCpFilterOptions, addLevelFilterOptions, addTrainFilterOption } from '../../../util/WebhookFilterOptions';
import { RaidsetConfig } from '../../../models/WebhookConfigurations';
import BaseWebhooksetCommand from './BaseWebhooksetCommand';

export default class RaidsetCommand extends BaseWebhooksetCommand {
	public constructor() {
		super('raidset', {
			webhookType: 'raid',
			description: {
				content: 'Set or update the raid webhook configuration for a particular channel.',
				usage: stripIndents`raidset
                  ex \`true|false\`
                  team \`uncontested|mystic|valor|instinct\`
                  boosted \`true|false\`
                  name \`pokemon's name\`
                  geofilter \`distance(km/m) lattitude,longitude|city\`
                  train`,
				examples: ['webhooks', 'webhooks #webhook-channel'],
			},
		});
		this.argumentConfigBlacklist.add('name');
		this.data
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
			.addStringOption((pokemonNameOption) =>
				pokemonNameOption.setName('name').setDescription('The name of a pokemon to filter on.'),
			);
		addCpFilterOptions(this.data);
		addLevelFilterOptions(this.data, 6);
		addTrainFilterOption(this.data);
	}

	public async handleArguments({
		interaction,
		channelConfiguration,
		filterErrorSuffix,
	}: {
		interaction: CommandInteraction;
		channelConfiguration: RaidsetConfig;
		filterErrorSuffix: string;
	}) {
		await super.handleArguments({ interaction, channelConfiguration });
		const pokemonNameArgument = interaction.options.getString('name', false);
		if (pokemonNameArgument !== null) {
			const pokemonId = ntim[pokemonNameArgument];
			if (pokemonId) {
				channelConfiguration.name = pokemonNameArgument.toLowerCase();
			} else {
				return `\n\nThe pokemon name '${pokemonNameArgument}' was provided but could not be found, the name filter was not ${filterErrorSuffix}.`;
			}
		}
	}
}
