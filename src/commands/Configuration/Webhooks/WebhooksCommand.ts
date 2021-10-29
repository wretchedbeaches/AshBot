import { ButtonInteraction, CommandInteraction, GuildChannel, MessageButton, TextChannel } from 'discord.js';
import Command from '../../../struct/commands/Command';
import { ActionRowPaginator } from '@psibean/discord.js-pagination';
import COMMAND_NAMES from '../../../util/CommandNames';

export default class WebhooksCommand extends Command {
	public constructor() {
		super(COMMAND_NAMES.CONFIGURATION.WEBHOOKS.MANAGE, {
			description: {
				content: 'Show or remove Webhook Configurations.',
				usage: 'webhooks',
				examples: ['webhooks show', 'webhooks show #webhook-channel', 'webhooks remove #webhook-channel'],
			},
			category: 'Webhooks',
			rateLimit: 3,
			cooldown: 3e5,
			isEphemeral: true,
		});
	}

	public async execute(interaction: CommandInteraction) {
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
			case 'show':
				return this.handleShow(interaction);
			case 'remove':
				return this.handleRemove(interaction);
		}
	}

	public async handleAllConfigurations(interaction: CommandInteraction, channels) {
		const channelIds = Object.keys(channels);

		const messageActionRows = [
			{
				components: [
					{
						type: 'BUTTON',
						label: 'First',
						emoji: '⏪',
						style: 'SECONDARY',
					},
					{
						type: 'BUTTON',
						label: 'Previous',
					},
					{
						type: 'BUTTON',
						label: 'Next',
					},
					{
						type: 'BUTTON',
						label: 'Last',
						emoji: '⏩',
						style: 'SECONDARY',
					},
				],
			},
		];

		const pageEmbedResolver = async ({ newIdentifiers, paginator }) => {
			const channelId = channelIds[newIdentifiers.pageIdentifier];
			const newEmbed = this.client.embed(paginator.interaction.guildId);
			const channel = await this.client.channels.fetch(channelId);

			if (channel === null) {
				newEmbed.setTitle(`Webhook Configuration: Unknown Channel '${channelId}'`);
				newEmbed.setDescription(`This configuration is for an unknown channel id '${channelId}'.`);
				// TODO: Check this isn't considered an empty embed.
				return newEmbed;
			}
			newEmbed.setTitle(
				`Webhook Configuration For Channel ${channel.isText() ? (channel as TextChannel).name : channelId}`,
			);

			newEmbed.addFields(
				Object.entries(channels[channelId]).map((entry) => {
					return {
						name: entry[0],
						value: JSON.stringify(entry[1]),
						inline: true,
					};
				}),
			);
			return newEmbed;
		};

		const identifiersResolver = ({
			interaction,
			paginator,
		}: {
			interaction: ButtonInteraction;
			paginator: ActionRowPaginator;
		}) => {
			const label = (interaction.component as MessageButton).label!.toLowerCase();
			let { pageIdentifier }: { pageIdentifier: number } = paginator.currentIdentifiers;
			switch (label) {
				case 'first':
					return paginator.initialIdentifiers;
				case 'next':
					pageIdentifier += 1;
					break;
				case 'previous':
					pageIdentifier -= 1;
					break;
				case 'last':
					pageIdentifier = paginator.maxNumberOfPages - 1;
			}
			if (pageIdentifier < 0) {
				pageIdentifier = (paginator.maxNumberOfPages as number) + (pageIdentifier % paginator.maxNumberOfPages);
			} else if (pageIdentifier >= paginator.maxNumberOfPages) {
				pageIdentifier %= paginator.maxNumberOfPages;
			}
			return { ...paginator.currentIdentifiers, pageIdentifier };
		};

		const paginator = new ActionRowPaginator(interaction, {
			messageActionRows,
			identifiersResolver,
			pageEmbedResolver,
			maxNumberOfPages: channels.length,
		});
		await paginator.send();
		return paginator.message;
	}

	public async handleShow(interaction: CommandInteraction) {
		const channelArgument = interaction.options.getChannel('channel', false) as TextChannel | null;
		const channels = this.client.settings.get(interaction.guildId, 'channels', null);
		const channelConfigurations = Object.values(channels);

		if (channels === null || channelConfigurations.length === 0) {
			const errorMessage = channelArgument
				? `There is no webhook configuration for '${channelArgument.name}'`
				: `There are no webhook configurations.`;
			return interaction.editReply(errorMessage);
		}

		if (channelArgument === null && Object.keys(channels).length > 1) {
			return this.handleAllConfigurations(interaction, channels);
		}
		const embed = this.client
			.embed(interaction.guildId)
			.setTitle(`Webhook Configuration For Channel ${channelArgument?.toString() ?? 'Unknown'}`);

		const channelConfiguration =
			channelArgument === null ? channelConfigurations[0] : channels[channelArgument.id] ?? {};
		const configEntries = Object.entries(channelConfiguration);
		if (configEntries.length > 0) {
			embed.addFields(
				configEntries.map((entry) => ({
					name: entry[0],
					value: JSON.stringify(entry[1]),
					inline: true,
				})),
			);
		} else {
			embed.setDescription(`No Webhook Configuration found for this channel.`);
		}
		return interaction.editReply({ embeds: [embed] });
	}

	public async handleRemove(interaction: CommandInteraction) {
		const guildId = interaction.guildId!;
		const channelArgument: GuildChannel = (interaction.options.getChannel('channel', false) ??
			interaction.channel!) as GuildChannel;
		const channelId = channelArgument.id;
		const channels = this.client.settings.get(guildId, 'channels', {});
		if (channels[channelId]) {
			const configType = channels[channelId].type as string;
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete channels[channelId];
			await this.client.settings.set(guildId, 'channels', channels);
			if (this.client.intervals.has(channelId)) {
				clearInterval(this.client.intervals.get(channelId)!);
				this.client.intervals.delete(channelId);
				this.client.embedQueue.delete(channelId);
				this.client.trains.delete(channelId);
			}
			return interaction.editReply(
				`Successfully removed the ${configType} webhook configuration from ${channelArgument.toString()}.`,
			);
		}
		return interaction.editReply(
			`There was no webhook configuration found for the provided channel '${channelArgument.toString()}'`,
		);
	}
}
