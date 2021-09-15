import { Collection } from "discord.js";
import { EventEmitter } from "events";
import BaseHandler, { BaseHandlerOptions } from "../BaseHandler";
import Listener from "./Listener";

const AkairoError = require('../../util/AkairoError');

export default class ListenerHandler extends BaseHandler {
    public emitters: Collection<string, EventEmitter>;
    public modules: Collection<string, Listener>;

    constructor(client, options: BaseHandlerOptions) {
        // TODO: throw equivalent error
        // if (!(options.classToHandle.prototype instanceof Listener || options.classToHandle === Listener)) {
        //     throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, Listener.name);
        // }

        super(client, options);

        this.emitters = new Collection();
        this.emitters.set('client', this.client);
    }

    public register(listener: Listener, filepath: string): Listener {
        super.register(listener, filepath);
        listener.exec = listener.exec.bind(listener);
        this.addToEmitter(listener.id);
        return listener;
    }

    public deregister(listener: Listener): void {
        this.removeFromEmitter(listener.id);
        super.deregister(listener);
    }

    public addToEmitter(id: string): Listener {
        const listener = this.modules.get(id.toString());
        // TODO: throw appropriate module not found error
        if (!listener) throw new AkairoError('MODULE_NOT_FOUND', this.classToHandle.name, id);

        const emitter = listener.emitter instanceof EventEmitter ? listener.emitter : this.emitters.get(listener.emitter);

        if (listener.type === 'once') {
            emitter.once(listener.event, listener.exec);
            return listener;
        }

        emitter.on(listener.event, listener.exec);
        return listener;
    }

    public removeFromEmitter(id: string): Listener {
        const listener = this.modules.get(id.toString());
        // TODO: throw equivalent error
        if (!listener) throw new AkairoError('MODULE_NOT_FOUND', this.classToHandle.name, id);

        const emitter = listener.emitter instanceof EventEmitter ? listener.emitter : this.emitters.get(listener.emitter);
        emitter.removeListener(listener.event, listener.exec);
        return listener;
    }

    public setEmitters(emitters: Iterable<[string, EventEmitter]>) {
        for (const [key, value] of Object.entries(emitters)) {
            this.emitters.set(key, value);
        }

        return this;
    }
};