import { CommandInteraction, GuildChannel, TextChannel } from 'discord.js';
import Command, { CommandOptions } from '../../../struct/commands/Command';
import config from '../../../config.json';
import { APIInteractionDataResolvedChannel } from 'discord-api-types/v9';
import { CooldownScope } from '../../../struct/commands/CooldownManager';

interface BaseArgumentError {
	error: string;
	isUpdate?: boolean;
	guildId?: string;
	channelId?: string;
	channel?: GuildChannel | APIInteractionDataResolvedChannel;
}

export interface BaseArguments {
	error?: string;
	isUpdate: boolean;
	guildId: string;
	channelId: string;
	channel: TextChannel | APIInteractionDataResolvedChannel;
}

export interface WebhooksetCommandOptions extends CommandOptions {
	webhookType: string;
}

export default class BaseWebhooksetCommand extends Command {
	public argumentConfigBlacklist: Set<string>;
	public webhookType: string;

	public constructor(id, options: WebhooksetCommandOptions) {
		const { webhookType, ...rest } = options;
		super(id, {
			...rest,
			scope: 'guild',
			category: 'Webhooks',
			rateLimit: 3,
			defaultPermission: false,
			isEphemeral: true,
			cooldownScope: CooldownScope.GUILD,
		});
		this.webhookType = webhookType;
		this.argumentConfigBlacklist = new Set(['channel', 'update', 'radius', 'city', 'latitude', 'longitude', 'unit']);
	}

	public async execute(interaction: CommandInteraction) {
		const baseArguments = this.handleBaseArguments(interaction);
		if (baseArguments.error) {
			return interaction.editReply(baseArguments.error);
		}

		const { isUpdate, guildId, channel, channelId } = baseArguments as BaseArguments;
		const channelConfigurations = this.client.settings.get(guildId, 'channels', {});
		const channelConfiguration =
			isUpdate && channelConfigurations[channelId] !== undefined
				? channelConfigurations[channelId]
				: { type: this.webhookType };

		if (isUpdate && channelConfiguration.type !== this.webhookType)
			return interaction.editReply(
				`You cannot update a Webhook Configuration of type '${channelConfiguration.type as string}' using the '${
					this.id
				}' command.`,
			);

		const filterErrorSuffix = isUpdate ? 'updated' : 'set';
		let error = this.parseGeofilterOptions(interaction, channelConfiguration, filterErrorSuffix);
		const extraError = await this.handleArguments({
			interaction,
			channelConfiguration,
			channel,
			filterErrorSuffix,
			channelId,
			isUpdate,
		});
		if (extraError) error += extraError;

		channelConfigurations[channelId] = channelConfiguration;
		if (this.client.intervals.has(channelId)) clearInterval(this.client.intervals.get(channelId)!);
		await this.client.settings.set(guildId, 'channels', channelConfigurations);
		this.client.embedQueue.set(channelId, []);
		this.client.setInterval(channelId);
		this.client.trains.delete(channelId);
		const finalError = error === '' ? '' : ` However the following errors occurred:\n\n${error.trim()}`;
		const configEmbed = this.getConfigEmbed(guildId, (channel as GuildChannel).toString(), channelConfiguration);
		return interaction.editReply({
			content: `Successfully updated ${channel.name} channel's ${this.webhookType} webhook configuration.${finalError}`,
			embeds: [configEmbed],
		});
	}

	public handleBaseArguments(interaction: CommandInteraction): BaseArgumentError | BaseArguments {
		// Create/overwrite by default if update argument is not provided.
		const isUpdate = interaction.options.getBoolean('update', false) ?? false;
		// TODO: once https://github.com/discordjs/builders/pull/41 is merged
		// Only allow for only text channels to be selected for this argument.
		const channel = (interaction.options.getChannel('channel', false) ?? interaction.channel) as TextChannel;
		const guildId = interaction.guildId!;

		return {
			isUpdate,
			guildId,
			channel: channel,
			channelId: channel.id,
		};
	}

	public handleArguments({
		interaction,
		channelConfiguration,
	}: {
		interaction: CommandInteraction;
		channelConfiguration: any;
		channel?: GuildChannel | APIInteractionDataResolvedChannel;
		channelId?: string;
		filterErrorSuffix?: string;
		isUpdate?: boolean;
	}): Promise<string | void> | string | void {
		for (const argument of interaction.options.data) {
			if (this.argumentConfigBlacklist.has(argument.name)) continue;
			const argumentValue = argument.value ?? null;
			if (argumentValue !== null) channelConfiguration[argument.name] = argumentValue;
		}
	}

	public parseGeofilterOptions(interaction: CommandInteraction, channelConfiguration, errorSuffix: string) {
		let error = '';
		const cityArgument = interaction.options.getString('city', false);
		// If a city is provided it shall take priority.
		if (cityArgument === null) {
			const radiusArgument = interaction.options.getNumber('radius', false);
			const latitudeArgument = interaction.options.getNumber('latitude', false);
			const longitudeArgument = interaction.options.getNumber('longitude', false);
			const hasLatLong = latitudeArgument && longitudeArgument;

			const attemptedToSetGeofilter =
				radiusArgument !== null && (latitudeArgument !== null || longitudeArgument !== null);
			if (radiusArgument !== null) {
				const unitArgument = interaction.options.getString('unit') as 'km' | 'm' | null;
				if (unitArgument === null) {
					error = `A radius of '${radiusArgument}' was provided without a unit (m or km), geofilter was not ${errorSuffix}.`;
				} else if (hasLatLong) {
					channelConfiguration.geofilter = {
						center: [latitudeArgument, longitudeArgument],
						radius: radiusArgument,
						unit: unitArgument,
					};
				}
			} else if (attemptedToSetGeofilter) {
				error = `The following arguments were provided for the geo filter:`;
				error += `\nlat/long: '${latitudeArgument ?? ''}/${longitudeArgument ?? ''}'`;
				error += `\n\n**But no radius was provided and is required when providing a lat/long.**\nGeofilter was not ${errorSuffix}`;
			}
		} else if (config.cities[cityArgument.toLowerCase()]) {
			channelConfiguration.geofilter = cityArgument.toLowerCase();
		} else {
			error = `City '${cityArgument}' was provided but could not be found, geofilter was not ${errorSuffix}.`;
		}
		return error;
	}

	public getConfigEmbed(guildId: string, channelString: string, channelConfiguration) {
		const embed = this.client.embed(guildId).setTitle(`Webhook Configuration For Channel ${channelString}`);

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
			embed.setDescription(`Configuration was created but without any filters...`);
		}
		return embed;
	}
}
