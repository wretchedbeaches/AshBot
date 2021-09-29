import { CommandInteraction } from 'discord.js';
import Command from '../../struct/commands/Command';

export default class PingCommand extends Command {
	public constructor() {
		super('ping', {
			category: 'Public Commands',
			description: {
				content: 'Check the latency of the ping to the Discord API',
				usage: 'ping',
				examples: ['ping'],
			},
			ratelimit: 3,
		});
	}

	public execute(interaction: CommandInteraction) {
		return interaction.editReply({ content: `Pong! \`${this.client.ws.ping}ms\`` });
	}
}
