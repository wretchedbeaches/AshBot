import { CommandInteraction } from 'discord.js';
import Command from '../../struct/commands/Command';
import COMMAND_NAMES from '../../util/CommandNames';

export default class PingCommand extends Command {
	public constructor() {
		super(COMMAND_NAMES.PUBLIC.PING, {
			category: 'Public',
			description: {
				content: 'Check the latency of the ping to the Discord API',
				usage: 'ping',
				examples: ['ping'],
			},
			rateLimit: 3,
		});
	}

	public execute(interaction: CommandInteraction) {
		return interaction.editReply({ content: `Pong! \`${this.client.ws.ping}ms\`` });
	}
}
