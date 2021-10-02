import { APIApplicationCommand, Routes } from 'discord-api-types/v9';
import { ApplicationCommandPermissions, Collection, CommandInteraction, Interaction } from 'discord.js';
import BaseClient from '../../client/BotClient';
import BaseHandler, { BaseHandlerOptions } from '../BaseHandler';
import InhibitorHandler from '../inhibitors/InhibitorHandler';
import ListenerHandler from '../listeners/ListenerHandler';
import { CommandHandlerEvents } from '../Util';
import Command from './Command';
import CooldownManager from './CooldownManager';

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
	public cooldownManager?: CooldownManager;
	public cooldowns: Collection<string, Collection<string, CooldownData>>;
	public inhibitorHandler?: InhibitorHandler;
	public listenerHandler: ListenerHandler;
	public modules: Collection<string, Command>;
	public classToHandle: new (...args: any[]) => Command;

	public constructor(
		client: BaseClient,
		{ directory, automateCategories, blockClient = true, blockBots = true, cooldownManager }: CommandHandlerOptions,
	) {
		super(client, {
			directory,
			automateCategories,
		});
		this.classToHandle = Command;
		this.blockClient = blockClient;
		this.blockBots = blockBots;
		this.cooldowns = new Collection();
		this.cooldownManager = cooldownManager;
		this.inhibitorHandler = undefined;
		this.setup();
	}

	public setup(): void {
		this.client.once('ready', async () => {
			this.client.on('interactionCreate', (interaction: Interaction) => {
				// eslint-disable-next-line @typescript-eslint/no-floating-promises
				if (interaction.isCommand()) this.handle(interaction);
			});
			await this.loadAll();
		});
	}

	public getGlobalCommands(): Promise<APIApplicationCommand[]> {
		return this.client.restApi.get(
			Routes.applicationCommands(this.client.config.clientId) as unknown as `/${string}`,
		) as Promise<APIApplicationCommand[]>;
	}

	public getGuildCommands(guildId: string): Promise<APIApplicationCommand[]> {
		return this.client.restApi.get(
			Routes.applicationGuildCommands(this.client.config.clientId, guildId) as unknown as `/${string}`,
		) as Promise<APIApplicationCommand[]>;
	}

	public getGlobalCommand(command: Command) {
		if (command.registeredId)
			return this.client.restApi.get(
				Routes.applicationCommand(this.client.config.clientId, command.registeredId) as unknown as `/${string}`,
			);
	}

	public getGuildCommand(command: Command, guildId: string) {
		if (command.registeredId)
			return this.client.restApi.get(
				Routes.applicationGuildCommand(
					this.client.config.clientId,
					guildId,
					command.registeredId,
				) as unknown as `/${string}`,
			);
	}

	public registerCommandGlobally(command: Command): Promise<APIApplicationCommand> {
		return this.client.restApi.post(
			Routes.applicationCommands(this.client.config.clientId) as unknown as `/${string}`,
			{ body: command.data.toJSON() },
		) as Promise<APIApplicationCommand>;
	}

	public async registerGlobalCommands(commands: Command[]) {
		return this._registerGlobalCommands(this.commandsToData(commands));
	}

	public _registerGlobalCommands(commands: any[]) {
		return this.client.restApi.put(Routes.applicationCommands(this.client.config.clientId) as unknown as `/${string}`, {
			body: commands,
		});
	}

	public registerGuildCommands(commands: Command[], guildId: string) {
		return this._registerGuildCommands(this.commandsToData(commands), guildId);
	}

	public _registerGuildCommands(commands: any[], guildId: string) {
		return this.client.restApi.put(
			Routes.applicationGuildCommands(this.client.config.clientId, guildId) as unknown as `/${string}`,
			{ body: commands },
		);
	}

	public updateGlobalCommand(command: Command) {
		if (command.registeredId)
			return this.client.restApi.put(
				Routes.applicationCommand(this.client.config.clientId, command.registeredId) as unknown as `/${string}`,
				{ body: command.data.toJSON() },
			);
	}

	public updateGuildCommand(command: Command, guildId: string) {
		if (command.registeredId)
			return this.client.restApi.patch(
				Routes.applicationGuildCommand(
					this.client.config.clientId,
					guildId,
					command.registeredId,
				) as unknown as `/${string}`,
				{ body: command.data.toJSON() },
			);
	}

	public unregisterGlobalCommand(command: Command) {
		if (command.registeredId)
			return this.client.restApi
				.delete(Routes.applicationCommand(this.client.config.clientId, command.registeredId) as unknown as `/${string}`)
				.then((result) => {
					this.deregister(command);
					return result;
				});
	}

	public unregisterGuildCommand(command: Command, guildId: string) {
		if (command.registeredId)
			return this.client.restApi.delete(
				Routes.applicationGuildCommand(
					this.client.config.clientId,
					guildId,
					command.registeredId,
				) as unknown as `/${string}`,
			);
	}

	// TODO: Permission based calls - may need to update Command class types.
	public getAllGuildCommandPermissions(guildId: string) {
		return this.client.restApi.get(
			Routes.guildApplicationCommandsPermissions(this.client.config.clientId, guildId) as unknown as `/${string}`,
		);
	}

	public getGuildCommandPermissions(command: Command, guildId: string) {
		if (!command.registeredId) return;
		return this.client.restApi.get(
			Routes.applicationCommandPermissions(this.client.config.clientId, guildId, command.registeredId),
		);
	}

	public setGuildCommandPermissions(guildId: string, permissions: ApplicationCommandPermissions[]) {
		return this.client.restApi.put(Routes.guildApplicationCommandsPermissions(this.client.config.clientId, guildId), {
			body: { permissions },
		});
	}

	public updateGuildCommandPermissions(
		command: Command,
		guildId: string,
		permissions: ApplicationCommandPermissions[],
	) {
		if (!command.registeredId) return;
		return this.client.restApi.put(
			Routes.applicationCommandPermissions(this.client.config.clientId, guildId, command.registeredId),
			{ body: { permissions } },
		);
	}

	public async loadAll(directory: string = this.directory): Promise<CommandHandler> {
		await super.loadAll(directory);
		// TODO: WIll need to update the global registration logic
		// Filter all global commands with the names of the registered commands.
		// For any that aren't registered, register them each individually instead
		const registeredGlobalCommands = await this.getGlobalCommands();

		for (const registeredGlobalCommand of registeredGlobalCommands) {
			if (this.modules.has(registeredGlobalCommand.name)) {
				this.modules.get(registeredGlobalCommand.name)!.registeredId = registeredGlobalCommand.id;
				const wrapper = '===============';
				console.log(`${wrapper} REGISTERED COMMAND ${wrapper}`);
				console.log(registeredGlobalCommand);
				console.log(`${wrapper} END REGISTERED COMMAND ${wrapper}`);
				console.log(`\n\n${wrapper} COMMAND DATA ${wrapper}`);
				console.log(registeredGlobalCommand);
				console.log(`${wrapper} END COMMAND DATA ${wrapper}`);
			}
		}
		const globalCommands = this.modules.filter((command) => command.scope === 'global');
		if (registeredGlobalCommands.length === globalCommands.size) return this;

		// TODO: guild restricted logic
		// Guild restricted commands should be registered against a list of guilds in the DB to load them for.
		// const guildCommands = this.modules.filter(command => command.scope !== 'global');
		const promises: Promise<unknown>[] = [];
		promises.push(this.registerGlobalCommands(Array.from(globalCommands.values())));
		await Promise.all(promises);
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

		if (
			(command.channels.size > 0 && interaction.channel === null) ||
			(interaction.channel !== null && !command.channels.has(interaction.channel.type))
		) {
			this.emit(CommandHandlerEvents.COMMAND_BLOCKED, { interaction, command, reason: 'channel' });
			return true;
		}

		if (this.cooldownManager !== undefined && (await this.cooldownManager.runCooldowns(interaction, command))) {
			return true;
		}

		return false;
	}

	public async runInhibitors(interaction: CommandInteraction, command: Command) {
		const reason = this.inhibitorHandler ? await this.inhibitorHandler.test(interaction, command) : null;

		if (reason !== null) {
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
