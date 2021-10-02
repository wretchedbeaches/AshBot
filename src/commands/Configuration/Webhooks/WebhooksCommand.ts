import { ButtonInteraction, CommandInteraction, MessageButton, TextChannel } from 'discord.js';
import Command from '../../../struct/commands/Command';
import { ActionRowPaginator } from '@psibean/discord.js-pagination';

export default class WebhooksCommand extends Command {
	public constructor() {
		super('webhooks', {
			description: {
				content: 'Returns a list of all webhook channels.',
				usage: 'webhooks',
				examples: ['webhooks', 'webhooks #webhook-channel'],
			},
			category: 'Webhooks',
			ratelimit: 3,
		});

		this.data.addChannelOption((option) =>
			option.setName('channel').setDescription('Channel to get Webhook Configuration for').setRequired(false),
		);
	}

	public async handleAllConfigurations(interaction: CommandInteraction, channels) {
		const channelIds = Object.keys(channels);

		const messageActionRows = [
			{
				components: [
					{
						label: 'First',
						emoji: '⏪',
						style: 'SECONDARY',
						disabled: true,
					},
					{
						label: 'Previous',
						disabled: true,
					},
					{
						label: 'Delete',
						style: 'DANGER',
						disabled: true,
					},
					{
						label: 'Next',
						disabled: true,
					},
					{
						label: 'Last',
						emoji: '⏩',
						style: 'SECONDARY',
						disabled: true,
					},
				],
			},
		];

		const pageEmbedResolver = async ({ newIdentifiers, paginator }) => {
			const channelId = channelIds[newIdentifiers.pageIdentifier];
			const newEmbed = this.client.embed(paginator.interaction.guildId);
			const channel = await this.client.channels.fetch(channelId);
			// TODO: Provide an option to either delete the configuration for the unknown channel
			// Or to update the configuration to a new channel.
			if (channel === null) {
				newEmbed.setTitle(`Webhook Configuration: Unknown Channel '${channelId}'`);
				newEmbed.setDescription(`This configuration is for an unknown channel id '${channelId}'.`);
				// TODO: Check this isn't considered an empty embed.
				return newEmbed;
			}
			newEmbed.setTitle(
				`Webhook 
				Configuration For Channel ${channel.isText() ? (channel as TextChannel).name : channelId}`,
			);

			newEmbed.addFields(
				Object.entries(channel).map((entry) => {
					return {
						name: entry[0],
						value: JSON.stringify(entry[1]),
						inline: true,
					};
				}),
			);
			return newEmbed;
		};

		const identifiersResolver = async ({
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
				case 'delete':
					await paginator.message.delete();
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

	public async execute(interaction: CommandInteraction) {
		const channelArgument = interaction.options.getChannel('channel', false);
		// TODO: Can't 100% guarantee guildId here until figuring out guild only API logic.
		// Otherwise local guild only inhibitor logic.
		let channels = this.client.settings.get(interaction.guildId, 'channels', {});
		if (channelArgument) channels = channels[channelArgument.id];

		if (!channels) {
			const errorMessage = channelArgument
				? `There is no webhook configuration for '${channelArgument.name}'`
				: `There are no webhook configurations.`;
			return interaction.editReply(errorMessage);
		}

		if (channelArgument === null) {
			return this.handleAllConfigurations(interaction, channels);
		}

		const embed = this.client
			.embed(interaction.guildId!)
			.setTitle(`Webhook Configuration For Channel ${(channelArgument as TextChannel).name}`);

		const channelConfiguration = channels[channelArgument.id] ?? {};
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
		const pages = [embed];
		const identifiersResolver = ({
			interaction,
			paginator,
		}: {
			interaction: ButtonInteraction;
			paginator: ActionRowPaginator;
		}) => {
			if ((interaction.component as MessageButton).label === 'delete') {
				return paginator.message.delete();
			}
		};
		const paginator = new ActionRowPaginator(interaction, { identifiersResolver, pages });
		await paginator.send();
		return paginator.message;
	}
}
