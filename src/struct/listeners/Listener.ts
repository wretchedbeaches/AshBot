import { EventEmitter } from "events";
import BaseModule, { BaseModuleOptions } from "../BaseModule";
import { ErrorMessages } from "../Util";
import ListenerHandler from "./ListenerHandler";

export interface ListenerOptions extends BaseModuleOptions {
    emitter: string | EventEmitter;
    event: string;
    type?: string;
}

export default class Listener extends BaseModule {
    public emitter: string | EventEmitter;
    public event: string;
    public type: string;
    public handler: ListenerHandler;

    constructor(id, { emitter, event, type = 'on', ...rest }: ListenerOptions) {
        super(id, rest);
        this.emitter = emitter;
        this.event = event;
        this.type = type;
    }

    public execute(...args: any[]): any {
        throw new Error(ErrorMessages.NOT_IMPLEMENTED(this.constructor.name, 'execute'));
    }
};

