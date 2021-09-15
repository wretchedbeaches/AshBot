import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction, PermissionFlags, PermissionResolvable } from "discord.js";
import { ChannelTypes } from "discord.js/typings/enums";
import BaseModule, { BaseModuleOptions } from "../BaseModule";
import CommandHandler from "./CommandHandler";

const AkairoError = require('../../util/AkairoError');

export interface CommandOptions extends BaseModuleOptions {
    channels?: Set<ChannelTypes>;
    ownerOnly?: boolean;
    cooldown?: number;
    ignoreCooldown?: Array<string> | ((interaction: Interaction, command: Command) => boolean);
    ratelimit?: number;
    description?: string;
    clientPermissions?: Set<PermissionFlags>;
    userPermissions?: Set<PermissionFlags>;
    shouldDefer?: boolean;
}

export default class Command extends BaseModule {
    public channels: Set<ChannelTypes>;
    public ownerOnly: boolean;
    public cooldown: number;
    public ignoreCooldown: Array<string> | ((interaction: Interaction, command: Command) => boolean);
    public ratelimit: number;
    public description: string | Array<string>;
    public clientPermissions: Set<PermissionFlags>;
    public userPermissions: Set<PermissionFlags>;
    public shouldDefer: boolean;
    public data: SlashCommandBuilder;
    public handler: CommandHandler;

    constructor(id: string, options: CommandOptions) {
        super(id, { category: options.category });

        const {
            channels = new Set(),
            ownerOnly = false,
            cooldown = null,
            ignoreCooldown = null,
            ratelimit = 1,
            description = '',
            clientPermissions = new Set(),
            userPermissions = new Set(),
            shouldDefer = true,
        } = options;

        this.channels = channels;
        this.ownerOnly = ownerOnly;
        this.cooldown = cooldown;
        this.ignoreCooldown = ignoreCooldown;
        this.ratelimit = ratelimit;
        this.description = Array.isArray(description) ? description.join('\n') : description;
        this.clientPermissions = clientPermissions;
        this.userPermissions = userPermissions;
        this.ignoreCooldown = typeof ignoreCooldown === 'function' ? ignoreCooldown.bind(this) : ignoreCooldown;
        this.shouldDefer = shouldDefer;
    }

    public shouldExecute(interaction: Interaction): Promise<boolean> | boolean {
        return true;
    }

    public execute(interaction: Interaction): Promise<any> | any {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }
};