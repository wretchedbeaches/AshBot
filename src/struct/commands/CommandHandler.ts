import { APIApplicationCommand, Routes } from "discord-api-types/v9";
import { Collection, CommandInteraction, Interaction } from "discord.js";
import BaseClient from "../../client/BotClient";
import BaseHandler, { BaseHandlerOptions } from "../BaseHandler";
import InhibitorHandler from "../inhibitors/InhibitorHandler";
import ListenerHandler from "../listeners/ListenerHandler";
import { CommandHandlerEvents } from "../Util";
import Command, { CommandDataType } from "./Command";

export interface CommandHandlerOptions extends BaseHandlerOptions {
    blockClient?: boolean;
    blockBots?: boolean;
    defaultCooldown?: number;
    ignoreCooldown?: string[];
}

export type CooldownData = {
    timer?: NodeJS.Timeout;
    end?: number;
    uses?: number;
}

export type CommandBlockedData = {
    interaction: Interaction;
    command: Command;
    reason: string;
}

export default class CommandHandler extends BaseHandler {
    public blockClient: boolean;
    public blockBots: boolean;
    public defaultCooldown: number;
    public ignoreCooldown: string[];
    public cooldowns: Collection<string, CooldownData>;
    public inhibitorHandler: InhibitorHandler;
    public listenerHandler: ListenerHandler;
    public modules: Collection<string, Command>;
    public classToHandle: new (...args: any[]) => Command;

    public constructor(client: BaseClient, {
        directory,
        automateCategories,
        blockClient = true,
        blockBots = true,
        defaultCooldown = 0,
        ignoreCooldown = client.owners,
    }: CommandHandlerOptions) {
        super(client, {
            directory,
            automateCategories,
        });
        this.classToHandle = Command;
        this.blockClient = blockClient;
        this.blockBots = blockBots;
        this.cooldowns = new Collection();
        this.defaultCooldown = defaultCooldown;
        this.ignoreCooldown = ignoreCooldown;
        this.inhibitorHandler = null;
        this.setup();
    }

    public setup(): void {
        this.client.once('ready', async () => {
            this.client.on('interactionCreate', (interaction: Interaction) => {
                if (interaction.isCommand())
                    this.handle(interaction);
            });
            await this.loadAll();
        });
    }

    public getGlobalCommands(): Promise<APIApplicationCommand[]> {
       return this.client.restApi.get(Routes.applicationCommands(this.client.config.clientId) as unknown as `/${string}`) as Promise<APIApplicationCommand[]>;
    }

    public getGuildCommands(guildId: string): Promise<APIApplicationCommand[]> {
        return this.client.restApi.get(Routes.applicationGuildCommands(this.client.config.clientId, guildId) as unknown as `/${string}`) as Promise<APIApplicationCommand[]>;
    }

    public registerCommandGlobally(command: Command): Promise<APIApplicationCommand> {
        return this.client.restApi.post(Routes.applicationCommands(this.client.config.clientId) as unknown as `/${string}`, { body: command.data.toJSON() }) as Promise<APIApplicationCommand>;
    }

    public async registerCommandsGlobally(commands: Command[]) {
        return this._registerCommandsGlobally(this.commandsToData(commands));
    }

    public _registerCommandsGlobally(commands: any[]) {
        return this.client.restApi.put(Routes.applicationCommands(this.client.config.clientId) as unknown as `/${string}`, { body: commands})
    }

    public registerCommandsForGuild(commands: Command[], guildId: string) {
        return this._registerCommandsForGuild(this.commandsToData(commands), guildId);
    }

    public _registerCommandsForGuild(commands: any[], guildId: string) {
        return this.client.restApi.put(Routes.applicationGuildCommands(this.client.config.clientId, guildId) as unknown as `/${string}`, { body: commands });
    }

    public async loadAll(directory: string = this.directory): Promise<CommandHandler> {
        super.loadAll(directory);
        // TODO: WIll need to update the global registration logic
        // Filter all global commands with the names of the registered commands.
        // For any that aren't registered, register them each individually instead
        const registeredCommands = await this.getGlobalCommands();
        const globalCommands = this.modules.filter(command => command.scope === 'global');
        if (registeredCommands.length === globalCommands.size) return this;
        // TODO: guild restricted logic
        // Guild restricted commands should be registered against a list of guilds in the DB to load them for.
        // const guildCommands = this.modules.filter(command => command.scope !== 'global');
        const promises = [];
        promises.push(this.registerCommandsGlobally(Array.from(globalCommands.values())));
        await Promise.all(promises);
        return this;
    }

    // TODO: Deregister functions

    public async handle(interaction: CommandInteraction): Promise<boolean | null> {
        let command: Command = null;
        try {
        const { commandName } = interaction;
        if (!this.modules.has(commandName)) return;

        command = this.modules.get(commandName);
        if (command.shouldDefer)
            await interaction.deferReply();
        if (await this.runCommandInhibitors(interaction, command)) {
            return false;
        }
        if (await this.runInhibitors(interaction, command))
            return false;
        if (await command.shouldExecute(interaction)) {
            await this.runCommand(interaction, command);
            return true;
        } else {
            this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason: 'shouldExecute' })
            return false;
        }
        
        } catch (error) {
            this.emitError(error, interaction, command);
            return null;
        }
    }

    public async runCommandInhibitors(interaction: CommandInteraction, command: Command) {
        if (this.blockClient && interaction.user.id === this.client.user.id) {
            this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason: 'self'})
        }

        if (this.blockBots && interaction.user.bot) {
            this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason: 'bot'})
            return true;
        }

        if (command.ownerOnly) {
            const isOwner = this.client.isOwner(interaction.user);
            if (!isOwner) {
                this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason: 'owner' });
                return true;
            }
        }

        if (command.channels.size > 0 && !command.channels.has(interaction.channel.type)) {
            this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason: 'channel' });
            return true;
        }

        if (this.runCooldowns(interaction, command)) {
            return true;
        }

        return false;
    }

    public async runInhibitors(interaction: CommandInteraction, command: Command) {
        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test(interaction, command)
            : null;

        if (reason !== null) {
            this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason});
            return true;
        }

        return false;
    }

    public runCooldowns(interaction: CommandInteraction, command: Command): boolean {
        const ignorer = command.ignoreCooldown || this.ignoreCooldown;
        const isIgnored = Array.isArray(ignorer)
            ? ignorer.includes(interaction.user.id)
            : ignorer(interaction, command);

        if (isIgnored) return false;

        const time = command.cooldown != null ? command.cooldown : this.defaultCooldown;
        if (!time) return false;

        const endTime = interaction.createdTimestamp + time;

        const userId = interaction.user.id;
        if (!this.cooldowns.has(userId)) this.cooldowns.set(userId, {});

        if (!this.cooldowns.get(userId)[command.id]) {
            this.cooldowns.get(userId)[command.id] = {
                timer: setTimeout(() => {
                    if (this.cooldowns.get(userId)[command.id]) {
                        clearTimeout(this.cooldowns.get(userId)[command.id].timer);
                    }
                    delete this.cooldowns.get(userId)[command.id];

                    if (Object.keys(this.cooldowns.get(userId)).length === 0) {
                        this.cooldowns.delete(userId);
                    }
                }, time),
                end: endTime,
                uses: 0
            };
        }

        const entry = this.cooldowns.get(userId)[command.id];

        if (entry.uses >= command.ratelimit) {
            const end = this.cooldowns.get(userId)[command.id].end;
            const diff = end - interaction.createdTimestamp;

            this.emit(CommandHandlerEvents.COOLDOWN, { interaction, command, remainingTime: diff });
            return true;
        }

        entry.uses++;
        return false;
    }

    public async runCommand(interaction: CommandInteraction, command: Command): Promise<void> {
        this.emit(CommandHandlerEvents.STARTED, { interaction, command });
        const result = await command.execute(interaction);
        this.emit(CommandHandlerEvents.ENDED, { interaction, command, result });
    }

    public useInhibitorHandler(inhibitorHandler: InhibitorHandler): CommandHandler {
        this.inhibitorHandler = inhibitorHandler;
        return this;
    }

    public useListenerHandler(listenerHandler: ListenerHandler): CommandHandler {
        this.listenerHandler = listenerHandler;
        return this;
    }

    
    public emitError(error: Error, interaction: Interaction, command: Command) {
        if (this.listenerCount(CommandHandlerEvents.ERROR)) {
            this.emit(CommandHandlerEvents.ERROR, { error, interaction, command });
            return;
        }

        throw error;
    }

    private commandsToData(commands: Command[]) {
        return commands.map(command => command.data.toJSON());
    }
};