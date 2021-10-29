import { CommandInteraction, ThreadChannelTypes } from 'discord.js';
import BaseModule, { BaseModuleAttributes, BaseModuleOptions } from '../BaseModule';
import CommandHandler from './CommandHandler';
import { ErrorMessages } from '../Util';
import BotClient from '../../client/BotClient';
import { CooldownScope } from './CooldownManager';

export type CommandScope = 'global' | 'guild';
export interface CommandHelpDescription {
	content: string;
	usage?: string;
	examples?: string[];
}

export interface InteractionCommandArgs {
	interaction: CommandInteraction;
	command: Command;
}

export interface CommandOptions extends BaseModuleOptions {
	channels?: CommandChannelType[];
	ownerOnly?: boolean;
	cooldown?: number;
	cooldownScope?: CooldownScope;
	ignoreCooldown?: CooldownIgnorer;
	rateLimit?: number;
	description: CommandHelpDescription;
	clientPermissions?: bigint[];
	userPermissions?: bigint[];
	defaultPermission?: boolean;
	shouldDefer?: boolean;
	isEphemeral?: boolean;
	scope?: CommandScope;
}

export interface CommandAttributes extends BaseModuleAttributes {
	client: BotClient;
}

export type CommandChannelType = 'DM' | 'GUILD_TEXT' | 'GUILD_NEWS' | ThreadChannelTypes;

export type CooldownIgnorer = Array<string> | ((args: InteractionCommandArgs) => Promise<boolean>);

export default class Command extends BaseModule implements CommandAttributes {
	public channels: Set<CommandChannelType>;
	public ownerOnly: boolean;
	public cooldown: number;
	public cooldownScope: CooldownScope;
	public ignoreCooldown: CooldownIgnorer;
	public rateLimit: number;
	public description: CommandHelpDescription;
	public clientPermissions: bigint[];
	public userPermissions: bigint[];
	public shouldDefer: boolean;
	public isEphemeral: boolean | ((interaction: CommandInteraction, command: Command) => Promise<boolean> | boolean);
	public scope: CommandScope;
	public handler: CommandHandler;
	public client: BotClient;
	public registeredId?: string;

	public constructor(
		id: string,
		{
			channels,
			ownerOnly,
			cooldown,
			cooldownScope,
			ignoreCooldown,
			rateLimit,
			description,
			clientPermissions,
			userPermissions,
			shouldDefer,
			isEphemeral,
			scope,
			...rest
		}: CommandOptions,
	) {
		super(id, rest);
		this.channels = new Set();
		if (Array.isArray(channels)) for (const channel of channels) this.channels.add(channel);
		this.ownerOnly = ownerOnly ?? false;
		this.cooldown = cooldown ?? 0;
		this.cooldownScope = cooldownScope ?? CooldownScope.USER;
		this.ignoreCooldown = ignoreCooldown ?? [];
		this.rateLimit = rateLimit ?? 1;
		this.description = description;
		this.clientPermissions = clientPermissions ?? [];
		this.userPermissions = userPermissions ?? [];
		this.shouldDefer = shouldDefer ?? true;
		this.isEphemeral = isEphemeral ?? false;
		this.scope = scope ?? 'guild';
	}

	public shouldExecute(_: CommandInteraction): Promise<boolean> | boolean {
		return true;
	}

	public execute(_: CommandInteraction): Promise<any> | any {
		throw new Error(ErrorMessages.NOT_IMPLEMENTED(this.constructor.name, 'execute'));
	}
}
