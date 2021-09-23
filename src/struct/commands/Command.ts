import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, PermissionFlags, ThreadChannelTypes } from 'discord.js';
import BaseModule, { BaseModuleOptions } from '../BaseModule';
import CommandHandler from './CommandHandler';
import { ErrorMessages } from '../Util';

export type CommandScope = 'global' | 'guild';
export interface CommandHelpDescription {
	content: string;
	usage?: string;
	examples?: string[];
}

export interface CommandOptions extends BaseModuleOptions {
	channels?: CommandChannelType[];
	ownerOnly?: boolean;
	cooldown?: number;
	ignoreCooldown?: Array<string> | ((interaction: CommandInteraction, command: Command) => boolean);
	ratelimit?: number;
	description?: string;
	helpDescription: CommandHelpDescription;
	clientPermissions?: Set<PermissionFlags>;
	userPermissions?: Set<PermissionFlags>;
	shouldDefer?: boolean;
	scope?: CommandScope;
}

export type CommandChannelType = 'DM' | 'GUILD_TEXT' | 'GUILD_NEWS' | ThreadChannelTypes;

export default class Command extends BaseModule {
	public channels: Set<CommandChannelType>;
	public ownerOnly: boolean;
	public cooldown: number;
	public ignoreCooldown?: Array<string> | ((interaction: CommandInteraction, command: Command) => boolean);
	public ratelimit: number;
	public description: string;
	public helpDescription: CommandHelpDescription;
	public clientPermissions: Set<PermissionFlags>;
	public userPermissions: Set<PermissionFlags>;
	public shouldDefer: boolean;
	public scope: CommandScope;
	public data: SlashCommandBuilder;
	public handler: CommandHandler;

	public constructor(
		id: string,
		{
			channels = [],
			ownerOnly = false,
			cooldown = 0,
			ignoreCooldown,
			ratelimit = 1,
			description = '',
			helpDescription,
			clientPermissions = new Set(),
			userPermissions = new Set(),
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
		this.ignoreCooldown = typeof ignoreCooldown === 'function' ? ignoreCooldown.bind(this) : ignoreCooldown;
		this.ratelimit = ratelimit;
		this.helpDescription = helpDescription;
		this.description = description;
		this.clientPermissions = clientPermissions;
		this.userPermissions = userPermissions;
		this.shouldDefer = shouldDefer;
		this.scope = scope;
		this.data = new SlashCommandBuilder().setName(id).setDescription(this.description);
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
