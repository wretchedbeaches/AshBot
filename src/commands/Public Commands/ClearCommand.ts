import { CommandInteraction, Message, MessageEmbed, Permissions } from 'discord.js';
import Command from '../../struct/commands/Command';

export default class ClearCommand extends Command {
	public constructor() {
		super('clear', {
			description: {
				content: 'Deletes a specific number of messages.',
				usage: '<amount>',
			},
			category: 'Utilities',
			clientPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			isEphemeral: true,
			rateLimit: 2,
		});

		this.data.addNumberOption((amountOption) =>
			amountOption.setName('amount').setDescription('The number of messages to delete.').setRequired(true),
		);
	}

	public async execute(interaction: CommandInteraction) {
		const amountArgument = interaction.options.getInteger('amount', true);

		if (amountArgument < 1 || amountArgument > 100)
			return interaction.editReply('You can only delete 100 messages at a time.');

		try {
			// TODO: This check will soon be redundant as the option will be configured to
			// ONLY allow for text guild channels!
			if (interaction.channel?.type === 'GUILD_TEXT') {
				const deletedMessages = await interaction.channel.bulkDelete(amountArgument + 1, true);
				const embed = new MessageEmbed()
					.setColor([155, 200, 200])
					.setDescription(
						`${deletedMessages.size} ${deletedMessages.size > 1 ? 'messages were' : 'message was'} deleted`,
					);
				const responseMessage = await interaction.editReply({ embeds: [embed] });
				let message: Message;
				if (responseMessage instanceof Message) message = responseMessage;
				else message = new Message(this.client, responseMessage);

				setTimeout(() => {
					try {
						void message.delete();
					} catch (error) {
						this.client.logger.error(`Failed to delete a message during a timeout for the ClearCommand.`, { error });
					}
				}, 3000);
			}
		} catch (error) {
			this.client.logger.error('Something went wrong with the clear command.', {
				error,
				guild: interaction.guildId ?? '',
				user: interaction.user.id,
			});
			const fail = new MessageEmbed().setColor([245, 155, 55]).setDescription('Something went wrong.');
			return interaction.editReply({ embeds: [fail] });
		}
	}
}
