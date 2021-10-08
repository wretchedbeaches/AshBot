import { CommandInteraction } from 'discord.js';
import { stripIndents } from 'common-tags';
import Command from '../../../struct/commands/Command';
import { addGeofilterOptions, parseGeofilterOptions } from '../../../util/WebhookFilterOptions';
import { InvasionsetConfig } from '../../../models/WebhookConfigurations';

export default class InvasionSetCommand extends Command {
	public constructor() {
		super('invasionset', {
			description: {
				content: 'Set or remove the invasion webhook configuration for a particular channel.',
				usage: stripIndents`invasionset
        leader \`true|false\`
        geofilter \`distance(km/m) lattitude,longitude|city\`
        train`,
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
			.addBooleanOption((leaderOption) =>
				leaderOption.setName('leader').setDescription('Whether or not to filter on leaders.'),
			)
			.addBooleanOption((trainOption) =>
				trainOption.setName('train').setDescription('Whether or not to filter on train.'),
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
		const channelConfiguration: InvasionsetConfig =
			isUpdate && channelConfigurations[channelId] !== undefined ? channelConfigurations[channelId] : { type: 'raid' };

		const filterErrorSuffix = isUpdate ? 'updated' : 'set';
		const error = parseGeofilterOptions(interaction, channelConfiguration, filterErrorSuffix);

		const leaderArgument = interaction.options.getBoolean('leader', false);
		const trainArgument = interaction.options.getBoolean('train', false);
		if (leaderArgument !== null) channelConfiguration.leader = leaderArgument;
		if (trainArgument !== null) channelConfiguration.train = trainArgument;
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
