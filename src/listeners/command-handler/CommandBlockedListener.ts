import { CommandBlockedData } from '../../struct/commands/CommandHandler';
import Listener from '../../struct/listeners/Listener';
import { CommandHandlerEvents } from '../../struct/Util';

export default class CommandBlockedListener extends Listener {
	public constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: CommandHandlerEvents.COMMAND_BLOCKED,
			category: 'commandHandler',
		});
	}

	public execute({ interaction, command, reason }: CommandBlockedData): void {
		// TODO: Differentiate logging based on reason?
		this.client!.logger.info(`Command ${command.id} was blocked for user ${interaction.user.id}.`, {
			event: CommandHandlerEvents.COMMAND_BLOCKED,
			reason,
		});
	}
}
