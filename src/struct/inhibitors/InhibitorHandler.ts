import { Collection, Interaction } from 'discord.js';
import BaseHandler, { BaseHandlerOptions } from '../BaseHandler';
import Inhibitor from './Inhibitor';
import { isPromise } from '../Util';

export default class InhibitorHandler extends BaseHandler {
    public modules: Collection<string, Inhibitor>;
    public classToHandle: typeof Inhibitor;
    
    constructor(client, {
        directory,
        classToHandle = Inhibitor,
        automateCategories = false
    }: BaseHandlerOptions) {
        // TODO: ERROR OUT
        // if (!(classToHandle.prototype instanceof Inhibitor || classToHandle === Inhibitor)) {
        //     throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, Inhibitor.name);
        // }

        super(client, {
            directory,
            classToHandle,
            automateCategories,
        });
    }

    // TODO: command type
    public async test(interaction: Interaction, command: any): Promise<string|void> {
        if (!this.modules.size) return null;

        const promises = [];
        // TODO: assign an inhibitor a command cetagory and filter here?
        for (const inhibitor of this.modules.values()) {
            promises.push((async () => {
                let inhibited = inhibitor.exec(interaction, command);
                if (isPromise(inhibited)) inhibited = await inhibited;
                if (inhibited) return inhibitor;
                return null;
            })());
        }

        const inhibitedInhibitors = (await Promise.all(promises)).filter(r => r);
        if (!inhibitedInhibitors.length) return null;

        // TODO: priority?
        // inhibitedInhibitors.sort((a, b) => b.priority - a.priority);
        return inhibitedInhibitors[0].reason;
    }
};
