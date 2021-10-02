import { Collection, CommandInteraction } from 'discord.js';
import BaseHandler, { BaseHandlerOptions } from '../BaseHandler';
import Inhibitor from './Inhibitor';
import Command from '../commands/Command';
import { isPromise } from '../Util';

export default class InhibitorHandler extends BaseHandler {
	public modules: Collection<string, Inhibitor>;
	public classToHandle: new (...args: any[]) => Inhibitor;

	public constructor(client, options: BaseHandlerOptions) {
		super(client, options);
		this.classToHandle = Inhibitor;
	}

	private async runInhibitor(
		inhibitor: Inhibitor,
		interaction: CommandInteraction,
		command: Command,
	): Promise<Inhibitor | null> {
		let inhibited = inhibitor.execute(interaction, command);
		if (isPromise(inhibited)) inhibited = await inhibited;
		if (inhibited) return inhibitor;
		return null;
	}

	public async test(interaction: CommandInteraction, command: Command): Promise<string | undefined> {
		if (!this.modules.size) return;

		const promises: Promise<Inhibitor | null>[] = [];
		// TODO: assign an inhibitor a command cetagory and filter here?
		for (const inhibitor of this.modules.values()) {
			promises.push(this.runInhibitor(inhibitor, interaction, command));
		}

		const inhibitedInhibitors = (await Promise.all(promises)).filter((r) => r);
		if (inhibitedInhibitors.length === 0) return;
		if (inhibitedInhibitors.length >= 2) {
			inhibitedInhibitors.sort((a, b) => (b?.priority ?? 0) - (a?.priority ?? 0));
		}

		return inhibitedInhibitors[0]?.reason;
	}
}
