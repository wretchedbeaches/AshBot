import { CommandInteraction } from 'discord.js';
import { stripIndents } from 'common-tags';
import Command from '../../struct/commands/Command';
import COMMAND_NAMES from '../../util/CommandNames';

export default class HelpCommand extends Command {
	public constructor() {
		super(COMMAND_NAMES.PUBLIC.HELP, {
			category: 'Public',
			description: {
				content: 'View available commands on the bot',
				usage: 'help [command]',
				examples: ['help', 'help ping'],
			},
			rateLimit: 3,
			isEphemeral: true,
		});
	}

	public execute(interaction: CommandInteraction) {
		const commandArgument = interaction.options.getString('command', false);
		const avatarUrl = this.client.user!.avatarURL() ?? '';

		if (commandArgument) {
			const command = this.client.commandHandler.modules.get(commandArgument);
			// TODO: permission check on the command here to ensure users don't get help for commands they can't use.
			if (!command) {
				return interaction.editReply(`No command by the name '${commandArgument}' seems to exist...`);
			}
			const commandHelpEmbed = this.client.embed(interaction.guildId).setAuthor(`Help | ${commandArgument}`, avatarUrl)
				.setDescription(stripIndents`
          **Description:**
          ${command.description.content}

          **Usage:**
          ${command.description.usage ?? 'No usage provided'}

          **Examples:**
          ${
						command.description.examples
							? command.description.examples.map((example) => `\`${example}\``).join('\n')
							: 'No examples provided.'
					}
          `);
			return interaction.editReply({ embeds: [commandHelpEmbed] });
		}

		const embed = this.client
			.embed(interaction.guildId)
			.setAuthor(`Help | ${this.client.user!.username}`, avatarUrl)
			.setFooter(`/help [command] for more information on a command`);

		for (const category of this.handler.categories.values()) {
			if (['default'].includes(category.id)) continue;
			// TODO: Add a filter based on whether or not the user has permission to access the command
			embed.addField(
				category.id,
				category.map((cmd) => `**\`${cmd.id}\`**`).join(',') || 'No commands in this category.',
			);
		}

		return interaction.editReply({ embeds: [embed] });
	}
}
