import { EventEmitter } from "events";
import BaseModule, { BaseModuleOptions } from "../BaseModule";
import ListenerHandler from "./ListenerHandler";

const AkairoError = require('../../util/AkairoError');
const AkairoModule = require('../AkairoModule');

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

    constructor(id, options: ListenerOptions) {
        super(id, options);
        const {
            emitter,
            event,
            type = 'on'
        } = options;

        this.emitter = emitter;
        this.event = event;
        this.type = type;
    }

    public exec(): any {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }
};

