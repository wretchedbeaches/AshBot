import { SlashCommandBuilder } from '@discordjs/builders';
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
	ratelimit?: number;
	description: CommandHelpDescription;
	clientPermissions?: bigint[];
	userPermissions?: bigint[];
	defaultPermission?: boolean;
	shouldDefer?: boolean;
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
	public ratelimit: number;
	public description: CommandHelpDescription;
	public clientPermissions: bigint[];
	public userPermissions: bigint[];
	public shouldDefer: boolean;
	public scope: CommandScope;
	public data: SlashCommandBuilder;
	public handler: CommandHandler;
	public client: BotClient;
	public registeredId?: string;

	public constructor(
		id: string,
		{
			channels = [],
			ownerOnly = false,
			cooldown = 0,
			cooldownScope = CooldownScope.USER,
			ignoreCooldown,
			ratelimit = 1,
			description,
			defaultPermission = true,
			clientPermissions = [],
			userPermissions = [],
			shouldDefer = true,
			scope = 'global',
			...rest
		}: CommandOptions,
	) {
		super(id, rest);
		this.channels = new Set();
		if (Array.isArray(channels)) for (const channel of channels) this.channels.add(channel);
		this.ownerOnly = ownerOnly;
		this.cooldown = cooldown;
		this.cooldownScope = cooldownScope;
		this.ignoreCooldown = ignoreCooldown ?? [];
		this.ratelimit = ratelimit;
		this.description = description;
		this.clientPermissions = clientPermissions;
		this.userPermissions = userPermissions;
		this.shouldDefer = shouldDefer;
		this.scope = scope;
		this.data = new SlashCommandBuilder()
			.setName(id)
			.setDescription(this.description.content)
			.setDefaultPermission(defaultPermission);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public shouldExecute(_: CommandInteraction): Promise<boolean> | boolean {
		return true;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public execute(_: CommandInteraction): Promise<any> | any {
		throw new Error(ErrorMessages.NOT_IMPLEMENTED(this.constructor.name, 'execute'));
	}
}
