import { CommandInteraction } from 'discord.js';
import ntim from '../../../util/name_to_id_map.json';
import { stripIndents } from 'common-tags';
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
