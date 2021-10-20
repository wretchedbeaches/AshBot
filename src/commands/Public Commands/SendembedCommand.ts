import { ChannelType } from 'discord-api-types/v9';
import { CommandInteraction, TextChannel } from 'discord.js';
import Command from '../../struct/commands/Command';

export default class SendEmbedCommand extends Command {
	public constructor() {
		super('sendembed', {
			description: {
				content: 'Send an embed to a specific channel.',
				usage: 'sendembed #`channel` `message content`',
				examples: ['sendembed #general this text will go inside of an embed.'],
			},
			category: 'Utilities',
			rateLimit: 3,
			isEphemeral: true,
		});
		this.data
			.addChannelOption((channelOption) =>
				channelOption
					.setName('channel')
					.setDescription('The channel to send the embed to.')
					.addChannelType(ChannelType.GuildText)
					.setRequired(true),
			)
			.addStringOption((contentOption) =>
				contentOption.setName('content').setDescription('The content to send in the embed.').setRequired(true),
			);
	}

	public async execute(interaction: CommandInteraction) {
		const channel = interaction.options.getChannel('channel', true);
		const content = interaction.options.getString('content', true);
		if (channel.type === 'GUILD_TEXT') {
			await (channel as TextChannel).send({
				embeds: [this.client.embed(interaction.guildId).setDescription(content)],
			});
			return interaction.editReply(
				`${interaction.user.toString()}, sent embed message with content \`${content}\` to ${channel.name}`,
			);
		}
		return interaction.editReply(
			`Was unable to send the embed with content '${content} to the specified channel ${channel.name}.'`,
		);
	}
}
