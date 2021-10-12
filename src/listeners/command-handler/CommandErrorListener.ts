import Command from '../../struct/commands/Command';
import Listener from '../../struct/listeners/Listener';
import { CommandHandlerEvents } from '../../struct/Util';

export default class CommandErrorListener extends Listener {
	public constructor() {
		super('commandError', {
			emitter: 'commandHandler',
			event: CommandHandlerEvents.COMMAND_ERROR,
			category: 'commandHandler',
		});
	}

	public execute({ error, command }: { error: string; command: Command }): void {
		this.client!.logger.error(error, { event: this.event, command: command.id });
	}
}
