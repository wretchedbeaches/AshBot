import { APIApplicationCommand } from 'discord-api-types/v9';
import { CommandInteraction } from 'discord.js';
import Command from '../../struct/commands/Command';

export default class ManageCommands extends Command {
	public constructor() {
		super('managecommands', {
			description: {
				content: 'Administrative command management.',
			},
			category: 'Owner',
			ownerOnly: true,
			defaultPermission: false,
			scope: 'guild',
			isEphemeral: true,
		});
		this.data
			.addSubcommand((listSubcommand) =>
				listSubcommand
					.setName('list')
					.setDescription('Show a list of all commands.')
					.addStringOption((categoryOption) =>
						categoryOption.setName('category').setDescription('List commands for the specified category.'),
					),
			)
			.addSubcommand((updateSubcommand) =>
				updateSubcommand
					.setName('update')
					.setDescription('Update a command to the API.')
					.addStringOption((commandNameOption) =>
						commandNameOption
							.setName('command')
							.setDescription('The command name (by internal id) to update.')
							.setRequired(true),
					),
			);
	}

	public async execute(interaction: CommandInteraction) {
		const subcommand = interaction.options.getSubcommand(true);
		switch (subcommand) {
			case 'list':
				void this.handleList(interaction);
				break;
			case 'update':
				await this.handleUpdate(interaction);
				break;
		}
	}

	private handleList(interaction: CommandInteraction) {
		return interaction.editReply(`TODO: List of commands not yet done.`);
	}

	private async handleUpdate(interaction: CommandInteraction) {
		const { commandNameArgument, command } = this.parseCommand(interaction);

		if (!command) return interaction.editReply(`The command '${commandNameArgument}' could not be found.`);

		let updatedCount = 0;
		let updatedCommand: APIApplicationCommand | undefined;
		switch (command.scope) {
			case 'global':
				updatedCommand = await this.client.commandHandler.updateGlobalCommand(command);
				return interaction.editReply(
					updatedCommand ? `Successfully updated ${updatedCommand.name}.` : `Failed to update ${commandNameArgument}`,
				);
			case 'guild':
				updatedCount = await this.client.commandHandler.updateGuildCommand(command);
				return interaction.editReply(
					`Successfully updated the ${commandNameArgument} command for ${updatedCount} guild(s).`,
				);
		}
	}

	private parseCommand(interaction: CommandInteraction) {
		const commandNameArgument = interaction.options.getString('command', true);
		const command = this.client.commandHandler.modules.get(commandNameArgument);
		return { commandNameArgument, command };
	}
}
