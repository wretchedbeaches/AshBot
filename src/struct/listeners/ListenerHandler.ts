import { Collection } from 'discord.js';
import { EventEmitter } from 'events';
import BaseHandler, { BaseHandlerOptions } from '../BaseHandler';
import { ErrorMessages } from '../Util';
import Listener from './Listener';

export default class ListenerHandler extends BaseHandler {
	public emitters: Collection<string, EventEmitter>;
	public modules: Collection<string, Listener>;
	public classToHandle: new (...args: any[]) => Listener;

	public constructor(client, options: BaseHandlerOptions) {
		super(client, options);
		this.classToHandle = Listener;
		this.emitters = new Collection();
		this.emitters.set('client', this.client);
	}

	public register(listener: Listener, filepath: string): Listener {
		super.register(listener, filepath);
		listener.execute = listener.execute.bind(listener);
		this.addToEmitter(listener.id);
		return listener;
	}

	public deregister(listener: Listener): void {
		this.removeFromEmitter(listener.id);
		super.deregister(listener);
	}

	public addToEmitter(id: string): Listener {
		const listener = this.modules.get(id);
		if (!listener) throw new Error(ErrorMessages.MODULE_NOT_FOUND(this.classToHandle.name, id));

		const emitter = listener.emitter instanceof EventEmitter ? listener.emitter : this.emitters.get(listener.emitter);
		if (!emitter) return listener;

		if (listener.type === 'once') {
			emitter.once(listener.event, listener.execute);
			return listener;
		}

		emitter.on(listener.event, listener.execute);
		return listener;
	}

	public removeFromEmitter(id: string): Listener {
		const listener = this.modules.get(id);
		if (!listener) throw new Error(ErrorMessages.MODULE_NOT_FOUND(this.classToHandle.name, id));
		const emitter = listener.emitter instanceof EventEmitter ? listener.emitter : this.emitters.get(listener.emitter);
		if (!emitter) return listener;

		emitter.removeListener(listener.event, listener.execute);
		return listener;
	}

	public setEmitters(emitters: { [key: string]: EventEmitter }) {
		for (const [key, value] of Object.entries(emitters)) {
			this.emitters.set(key, value);
		}

		return this;
	}
}
