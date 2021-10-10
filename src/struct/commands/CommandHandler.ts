import { APIApplicationCommand, Routes } from 'discord-api-types/v9';
import { Collection, CommandInteraction, Interaction } from 'discord.js';
import BaseClient from '../../client/BotClient';
import BaseHandler, { BaseHandlerOptions } from '../BaseHandler';
import InhibitorHandler from '../inhibitors/InhibitorHandler';
import ListenerHandler from '../listeners/ListenerHandler';
import { CommandHandlerEvents } from '../Util';
import Command from './Command';
import CooldownManager from './CooldownManager';
import GuildCommandManager from './GuildCommandManager';

export interface CommandHandlerOptions extends BaseHandlerOptions {
	blockClient?: boolean;
	blockBots?: boolean;
	cooldownManager?: CooldownManager;
}

export interface CooldownData {
	timer: NodeJS.Timeout;
	end: number;
	uses: number;
}

export interface CommandBlockedData {
	interaction: Interaction;
	command: Command;
	reason: string;
}

export default class CommandHandler extends BaseHandler {
	public blockClient: boolean;
	public blockBots: boolean;
	public cooldownManager: CooldownManager | null;
	public cooldowns: Collection<string, Collection<string, CooldownData>>;
	public inhibitorHandler?: InhibitorHandler;
	public listenerHandler: ListenerHandler;
	public modules: Collection<string, Command>;
	public guildCommandManagers: Collection<string, GuildCommandManager>;
	public classToHandle: new (...args: any[]) => Command;

	public constructor(client: BaseClient, { blockClient, blockBots, cooldownManager, ...rest }: CommandHandlerOptions) {
		super(client, rest);
		this.classToHandle = Command;
		this.blockClient = blockClient ?? true;
		this.blockBots = blockBots ?? true;
		this.cooldowns = new Collection();
		this.cooldownManager = cooldownManager ?? null;
		this.inhibitorHandler = undefined;
		this.guildCommandManagers = new Collection();
		this.setup();
	}

	public setup(): void {
		this.client.once('ready', async () => {
			this.client.on('interactionCreate', async (interaction: Interaction) => {
				if (interaction.isCommand()) await this.handle(interaction);
			});
			for (const guild of this.client.guilds.cache.values()) await this.initGuild(guild.id);
		});
	}

	public async initGuild(guildId: string) {
		const guildHandler = new GuildCommandManager(this.client, guildId);
		await guildHandler.init(this.modules.filter((val) => val.scope === 'guild'));
		this.guildCommandManagers.set(guildId, guildHandler);
	}

	public removeGuild(guildId: string) {
		const guildManager = this.guildCommandManagers.get(guildId);
		if (guildManager) {
			guildManager.commands.clear();
			this.guildCommandManagers.delete(guildId);
		}
	}

	public getGlobalCommand(command: Command) {
		if (command.registeredId)
			return this.client.restApi.get(
				Routes.applicationCommand(this.client.config.clientId, command.registeredId) as unknown as `/${string}`,
			);
	}

	public createGlobalCommand(command: Command): Promise<APIApplicationCommand> {
		return this.client.restApi.post(
			Routes.applicationCommands(this.client.config.clientId) as unknown as `/${string}`,
			{ body: command.data.toJSON() },
		) as Promise<APIApplicationCommand>;
	}

	public updateGlobalCommand(command: Command) {
		if (command.registeredId)
			return this.client.restApi.put(
				Routes.applicationCommand(this.client.config.clientId, command.registeredId) as unknown as `/${string}`,
				{ body: command.data.toJSON() },
			);
	}

	public getGlobalCommands(): Promise<APIApplicationCommand[]> {
		return this.client.restApi.get(
			Routes.applicationCommands(this.client.config.clientId) as unknown as `/${string}`,
		) as Promise<APIApplicationCommand[]>;
	}

	public async setGlobalCommands(commands: Command[]) {
		return this.client.restApi.put(Routes.applicationCommands(this.client.config.clientId) as unknown as `/${string}`, {
			body: this.commandsToData(commands),
		});
	}

	public deleteGlobalCommand(registeredId: string, command?: Command) {
		return this.client.restApi
			.delete(Routes.applicationCommand(this.client.config.clientId, registeredId) as unknown as `/${string}`)
			.then((result) => {
				if (command) this.deregister(command);
				return result;
			});
	}

	public async loadAll(directories = this.directories): Promise<CommandHandler> {
		await super.loadAll(directories);
		const globalCommands = this.modules.filter((val) => val.scope === 'global');

		// TODO: WIll need to update the global registration logic
		// Filter all global commands with the names of the registered commands.
		// For any that aren't registered, register them each individually instead
		const registeredGlobalCommands = await this.getGlobalCommands();

		for (const registeredGlobalCommand of registeredGlobalCommands) {
			if (globalCommands.has(registeredGlobalCommand.name)) {
				this.modules.get(registeredGlobalCommand.name)!.registeredId = registeredGlobalCommand.id;
			} else {
				await this.deleteGlobalCommand(registeredGlobalCommand.id, globalCommands.get(registeredGlobalCommand.name));
			}
		}
		return this;
	}

	public async handle(interaction: CommandInteraction): Promise<boolean | null> {
		const { commandName } = interaction;
		if (!this.modules.has(commandName)) return false;

		const command = this.modules.get(commandName) as Command;

		try {
			if (command.shouldDefer) {
				const ephemeral =
					typeof command.isEphemeral === 'boolean'
						? command.isEphemeral
						: await command.isEphemeral(interaction, command);
				await interaction.deferReply({ ephemeral });
			}
			if (await this.runCommandInhibitors(interaction, command)) {
				return false;
			}
			if (await this.runInhibitors(interaction, command)) return false;
			if (await command.shouldExecute(interaction)) {
				await this.runCommand(interaction, command);
				return true;
			}
			this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason: 'shouldExecute' });
			return false;
		} catch (error) {
			this.emitError(error, interaction, command);
			return null;
		}
	}

	public async runCommandInhibitors(interaction: CommandInteraction, command: Command) {
		// Ensure the bot has appropriate permissions for the command
		if (interaction.guild && command.clientPermissions.length > 0) {
			const botMember = await interaction.guild.members.fetch(this.client.user!);
			for (const requiredPermission of command.clientPermissions) {
				if (!botMember.permissions.has(requiredPermission)) {
					this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason: 'clientPermission' });
					return true;
				}
			}
		}

		if (this.blockClient && interaction.user.id === this.client.user!.id) {
			this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason: 'self' });
			return true;
		}

		if (this.blockBots && interaction.user.bot) {
			this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason: 'bot' });
			return true;
		}

		if (command.ownerOnly) {
			const isOwner = this.client.isOwner(interaction.user);
			if (!isOwner) {
				this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason: 'owner' });
				return true;
			}
		}

		if (command.channels.size > 0 && interaction.channel !== null && !command.channels.has(interaction.channel.type)) {
			this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason: 'channel' });
			return true;
		}

		if (this.cooldownManager !== null && (await this.cooldownManager.runCooldowns(interaction, command))) {
			return true;
		}

		return false;
	}

	public async runInhibitors(interaction: CommandInteraction, command: Command) {
		const reason = this.inhibitorHandler ? await this.inhibitorHandler.test(interaction, command) : undefined;

		if (reason !== undefined) {
			this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason });
			return true;
		}

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
		return commands.map((command) => command.data.toJSON());
	}
}
