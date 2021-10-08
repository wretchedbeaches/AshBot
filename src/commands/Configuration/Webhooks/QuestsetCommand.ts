import { CommandInteraction } from 'discord.js';
import masterfile from '../../../util/masterfile.json';
import { stripIndents } from 'common-tags';
import Command from '../../../struct/commands/Command';
import { addGeofilterOptions, parseGeofilterOptions } from '../../../util/WebhookFilterOptions';
import { QuestsetConfig } from '../../../models/WebhookConfigurations';

export default class QuestsetCommand extends Command {
	public constructor() {
		super('questset', {
			description: {
				content: 'Set or remove the quest webhook configuration for a particular channel',
				usage: stripIndents`questset
        reward \`reward type\`
        geofilter \`distance(km/m) latitude,longitude|city\``,
				examples: ['questset stardust'],
			},
			category: 'Webhooks',
			ratelimit: 3,
		});

		const rewardTypes = Object.values(masterfile.quest_reward_types);
		const rewardTypeOptions: [string, string][] = [];
		for (const rewardType of rewardTypes) {
			rewardTypeOptions.push([rewardType.text.toLowerCase(), rewardType.text.toLowerCase()]);
		}
		this.data
			.addBooleanOption((updateOption) =>
				updateOption
					.setName('update')
					.setDescription('If true, existing config will be updated instead of overwritten.'),
			)
			.addStringOption((rewardTypeOption) =>
				rewardTypeOption
					.setName('rewardType')
					.setDescription('Search for quests with the specified reward type.')
					.addChoices(rewardTypeOptions),
			);
		addGeofilterOptions(this.data);
	}

	public async execute(interaction: CommandInteraction) {
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
		const channelConfiguration: QuestsetConfig =
			isUpdate && channelConfigurations[channelId] !== undefined ? channelConfigurations[channelId] : { type: 'quest' };

		const filterErrorSuffix = isUpdate ? 'updated' : 'set';
		const error = parseGeofilterOptions(interaction, channelConfiguration, filterErrorSuffix);
		const rewardType = interaction.options.getString('rewardType', false);
		if (rewardType !== null) channelConfiguration.rewardType = rewardType;
		// TODO: This setup is actually pretty bad if multiple users are editing a channel configuration at the same time...
		// If they both execute simultaneously, one may potentially overwrite the other...
		channelConfigurations[channelId] = channelConfiguration;
		if (this.client.intervals.has(channelId)) clearInterval(this.client.intervals.get(channelId)!);
		await this.client.settings.set(guildId, 'channels', channelConfigurations);
		// TODO: Refactor this and some other logic into a BaseWebhooksetCommand
		this.client.embedQueue.set(channelId, []);
		this.client.setInterval(channelId);
		this.client.trains.delete(channelId);
		const finalError = error === '' ? '' : ` However the following errors occurred:\n\n${error.trim()}`;
		return interaction.editReply(`Successfully updated channel quest webhook configuration.${finalError}`);
	}
}
