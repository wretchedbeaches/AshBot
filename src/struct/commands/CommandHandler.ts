import { APIApplicationCommand, Routes } from 'discord-api-types/v9';
import { Collection, CommandInteraction, Guild, Interaction } from 'discord.js';
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
	public cooldownManager: CooldownManager | null;
	public inhibitorHandler?: InhibitorHandler;
	public listenerHandler: ListenerHandler;
	public modules: Collection<string, Command>;
	public classToHandle: new (...args: any[]) => Command;
	public ownerOnlyCommands: IterableIterator<Command>;

	public constructor(client: BaseClient, { blockClient, blockBots, cooldownManager, ...rest }: CommandHandlerOptions) {
		super(client, rest);
		this.classToHandle = Command;
		this.blockClient = blockClient ?? true;
		this.blockBots = blockBots ?? true;
		this.cooldownManager = cooldownManager ?? null;
		this.inhibitorHandler = undefined;
		this.setup();
	}

	public setup(): void {
		this.client.once('ready', async () => {
			// TODO: Handle interactionCreate before commandHandler is actually ready.
			// E.g. shouldn't handle commands until all permissions and everything has been updated / checked.
			// This works for now, but currently commands used in that small period of time will just be ignored.
			const guilds = this.client.guilds.cache.values();
			const ownerGuilds: Guild[] = [];
			for (const guild of guilds) {
				await this.client.interactionManager?.registerInteractions();
				if (this.client.owners.includes(guild.ownerId)) ownerGuilds.push(guild);
			}

			this.client.on('interactionCreate', async (interaction: Interaction) => {
				if (interaction.isCommand()) await this.handle(interaction);
			});
		});
	}

	public getGlobalCommand(command: Command) {
		if (command.registeredId)
			return this.client.restApi.get(
				Routes.applicationCommand(this.client.config.clientId, command.registeredId) as unknown as `/${string}`,
			);
	}

	public getGlobalCommands(): Promise<APIApplicationCommand[]> {
		return this.client.restApi.get(
			Routes.applicationCommands(this.client.config.clientId) as unknown as `/${string}`,
		) as Promise<APIApplicationCommand[]>;
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
		this.ownerOnlyCommands = this.modules.filter((value) => value.ownerOnly).values();
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
		if (this.listenerCount(CommandHandlerEvents.COMMAND_ERROR) > 0) {
			this.emit(CommandHandlerEvents.COMMAND_ERROR, { error, interaction, command });
			return;
		}

		throw error;
	}
}
