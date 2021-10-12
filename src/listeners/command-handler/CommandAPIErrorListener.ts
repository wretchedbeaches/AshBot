import { APIApplicationCommand } from 'discord-api-types/v9';
import Command from '../../struct/commands/Command';
import Listener from '../../struct/listeners/Listener';
import { CommandHandlerEvents } from '../../struct/Util';

export default class CommandAPIErrorListener extends Listener {
	public constructor() {
		super('commandApiError', {
			emitter: 'commandHandler',
			event: CommandHandlerEvents.COMMAND_API_ERROR,
			category: 'commandHandler',
		});
	}

	public execute({ error, command }: { error: string; command: Command | APIApplicationCommand }): void {
		// TODO: Differentiate logging based on reason?
		this.handler.client.logger.error(error, {
			event: CommandHandlerEvents.COMMAND_BLOCKED,
			command: command instanceof Command ? command.id : command.name,
		});
	}
}
