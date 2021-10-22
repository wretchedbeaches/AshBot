import { CommandInteraction } from 'discord.js';
import Command from '../../struct/commands/Command';
import Listener from '../../struct/listeners/Listener';
import { CooldownManagerEvents } from '../../struct/Util';
import { durationFormatter } from '../../util/duration-formatter';

export default class GuildCreateListener extends Listener {
	public constructor() {
		super('cooldown', {
			emitter: 'cooldownManager',
			event: CooldownManagerEvents.COOLDOWN,
			category: 'cooldown',
		});
	}

	public execute({
		interaction,
		command,
		remainingTime,
	}: {
		interaction: CommandInteraction;
		command: Command;
		remainingTime: number;
	}) {
		// TODO: Format remaining time and clarify the cooldown scope.
		if (interaction.deferred && !interaction.replied)
			void interaction.editReply(
				`The ${command.id} can only be used ${
					command.rateLimit
				} time(s) within it's cooldown period.\nYou can use this command again in ${durationFormatter(remainingTime)}`,
			);
	}
}
