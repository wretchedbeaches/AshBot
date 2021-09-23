/* eslint-disable @typescript-eslint/no-unused-vars */
import { Interaction } from 'discord.js';
import BaseModule, { BaseModuleOptions } from '../BaseModule';
import Command from '../commands/Command';
import { ErrorMessages } from '../Util';
import InhibitorHandler from './InhibitorHandler';

interface InhibitorOptions extends BaseModuleOptions {
	reason: string;
	priority: number;
}

export default class Inhibitor extends BaseModule {
	public id: string;
	public reason: string;
	public priority: number;
	public handler: InhibitorHandler;

	public constructor(id: string, { reason, priority = 0, ...rest }: InhibitorOptions) {
		super(id, rest);
		this.id = id;
		this.reason = reason;
		this.priority = priority;
	}

	public execute(interaction: Interaction, command: Command): boolean | Promise<boolean> {
		throw new Error(ErrorMessages.NOT_IMPLEMENTED(this.constructor.name, 'execute'));
	}
}
