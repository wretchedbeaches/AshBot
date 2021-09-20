import { Collection, Interaction } from 'discord.js';
import BaseHandler, { BaseHandlerOptions } from '../BaseHandler';
import Inhibitor from './Inhibitor';
import { ErrorMessages, isPromise } from '../Util';
import Command from '../commands/Command';

export default class InhibitorHandler extends BaseHandler {
    public modules: Collection<string, Inhibitor>;
    public classToHandle: new (...args: any[]) => Inhibitor;

    public constructor(client, options: BaseHandlerOptions) {
        super(client, options);
        this.classToHandle = Inhibitor;
    }

    public async test(interaction: Interaction, command: Command): Promise<string|void> {
        if (!this.modules.size) return null;

        const promises = [];
        // TODO: assign an inhibitor a command cetagory and filter here?
        for (const inhibitor of this.modules.values()) {
            promises.push((async () => {
                let inhibited = inhibitor.execute(interaction, command);
                if (isPromise(inhibited)) inhibited = await inhibited;
                if (inhibited) return inhibitor;
                return null;
            })());
        }

        const inhibitedInhibitors = (await Promise.all(promises)).filter(r => r);
        if (!inhibitedInhibitors.length) return null;

        inhibitedInhibitors.sort((a, b) => b.priority - a.priority);
        return inhibitedInhibitors[0].reason;
    }
};
