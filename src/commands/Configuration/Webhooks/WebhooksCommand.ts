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
		this.data
			.addSubcommand((subcommand) =>
				subcommand
					.setName('show')
					.setDescription('Show Webhook Configuration.')
					.addChannelOption((option) =>
						option
							.setName('channel')
							.setDescription('The channel to view configuration for, otherwise all of them.')
							.setRequired(false),
					),
			)
			.addSubcommand(
				(subcommqand) =>
					subcommqand
						.setName('create_raid')
						.setDescription('Create a Raid Webhook Configuration.')
						.addChannelOption((channelOption) =>
							channelOption
								.setName('channel')
								.setDescription('The channel to create the configuration for.')
								.setRequired(true),
						)
						.addBooleanOption((trainOption) =>
							trainOption.setName('train').setDescription('Whether to filter on train.'),
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
						)
						.addIntegerOption((mincpOption) =>
							mincpOption.setName('mincp').setDescription('The minimum cp to filter on.'),
						)
						.addIntegerOption((maxcpOption) =>
							maxcpOption.setName('maxcp').setDescription('The maximum cp to filter on.'),
						)
						.addIntegerOption((minLevelOption) =>
							minLevelOption.setName('minlevel').setDescription('The minimum level to filter on.'),
						)
						.addIntegerOption((maxLevelOption) =>
							maxLevelOption.setName('maxlevel').setDescription('The maximum level to filter on.'),
						),
				// TODO: Add geofilter based options:
				// geofilter_city, geofilter_latitude, geofilter_longitude, geofilter_radiuse
			)
			.addSubcommand((subcommand) =>
				subcommand
					.setName('remove')
					.setDescription('Remove a Webhook Configuration.')
					.addChannelOption((option) =>
						option.setName('channel').setDescription('The channel to remove configuration for.').setRequired(true),
					),
			);
		this.data.addChannelOption((option) =>
			option.setName('channel').setDescription('Channel to get Webhook Configuration for').setRequired(false),
		);
	}

	public async execute(interaction: CommandInteraction) {
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
			case 'show':
				return this.handleShow(interaction);
			case 'create_raid':
				// TODO: Handle raid webhook creation (add others) - may need to split this into a CreateWebhook Command.
				// if it gets too large with option content.
				break;
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

	public async handleShow(interaction: CommandInteraction) {
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

	public async handleRemove(interaction: CommandInteraction) {
		// TODO: Add logic to ensure guild and channel in execute
		const guildId = interaction.guildId!;
		const settings = this.client.settings.get(guildId, 'channels', {});
		const channelId = interaction.channel!.id;
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete settings[channelId];
		await this.client.settings.set(guildId, 'channels', settings);
		if (this.client.intervals.has(channelId)) {
			clearInterval(this.client.intervals.get(channelId)!);
			this.client.intervals.delete(channelId);
			this.client.embedQueue.delete(channelId);
			this.client.trains.delete(channelId);
		}
		return interaction.editReply("Successfully removed channel's raid webhook configuration.");
	}
}
