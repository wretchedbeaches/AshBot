import { APIApplicationCommand, Routes } from 'discord-api-types/v9';
import { ApplicationCommandPermissions, Collection } from 'discord.js';
import BaseClient from '../../client/BotClient';
import Command from './Command';

export default class GuildCommandManager {
	public guildId: string;
	public client: BaseClient;
	public commands: Collection<string, string>;

	public constructor(client: BaseClient, guildId: string) {
		this.client = client;
		this.guildId = guildId;
		this.commands = new Collection();
	}

	public async init(commands: Collection<string, Command>) {
		const registeredGuildCommands = await this.getGuildCommands();
		console.log(`${this.guildId} has ${registeredGuildCommands.length} registered commands.`);
		for (const command of registeredGuildCommands) {
			if (commands.has(command.name)) this.commands.set(command.name, command.id);
			else await this.deleteGuildCommand(command.name, command.id);
		}

		const commandsToRegister = commands.filter((_, key) => {
			return !registeredGuildCommands.some((val) => val.name === key);
		});
		console.log(`Registering ${commandsToRegister.size} commands to ${this.guildId}`);
		for (const commandToRegister of commandsToRegister.values()) {
			await this.createGuildCommand(commandToRegister);
		}
	}

	public getGuildCommands(): Promise<APIApplicationCommand[]> {
		return this.client.restApi.get(
			Routes.applicationGuildCommands(this.client.config.clientId, this.guildId) as unknown as `/${string}`,
		) as Promise<APIApplicationCommand[]>;
	}

	public createGuildCommand(command: Command) {
		return (
			this.client.restApi.post(
				Routes.applicationGuildCommands(this.client.config.clientId, this.guildId) as unknown as `/${string}`,
				{
					body: command.data.toJSON(),
				},
			) as Promise<APIApplicationCommand>
		).then((result) => {
			this.commands.set(command.id, result.id);
			return result;
		});
	}

	public updateGuildCommand(command: Command) {
		if (command.registeredId)
			return this.client.restApi.patch(
				Routes.applicationGuildCommand(
					this.client.config.clientId,
					this.guildId,
					command.registeredId,
				) as unknown as `/${string}`,
				{ body: command.data.toJSON() },
			);
	}

	public setGuildCommands(commands: Command[]) {
		return this.client.restApi.put(
			Routes.applicationGuildCommands(this.client.config.clientId, this.guildId) as unknown as `/${string}`,
			{ body: this.commandsToData(commands) },
		);
	}

	public deleteGuildCommand(name: string, registeredId: string) {
		return this.client.restApi
			.delete(
				Routes.applicationGuildCommand(
					this.client.config.clientId,
					this.guildId,
					registeredId,
				) as unknown as `/${string}`,
			)
			.then((response) => {
				this.commands.delete(name);
				return response;
			});
	}

	// TODO: Permission based calls - may need to update Command class types.
	public getAllGuildCommandPermissions() {
		return this.client.restApi.get(
			Routes.guildApplicationCommandsPermissions(this.client.config.clientId, this.guildId) as unknown as `/${string}`,
		);
	}

	public getGuildCommandPermissions(command: Command) {
		if (!command.registeredId) return;
		return this.client.restApi.get(
			Routes.applicationCommandPermissions(
				this.client.config.clientId,
				this.guildId,
				command.registeredId,
			) as unknown as `/${string}`,
		);
	}

	public setGuildCommandPermissions(guildId: string, permissions: ApplicationCommandPermissions[]) {
		return this.client.restApi.put(
			Routes.guildApplicationCommandsPermissions(this.client.config.clientId, guildId) as unknown as `/${string}`,
			{
				body: { permissions },
			},
		);
	}

	public updateGuildCommandPermissions(
		command: Command,
		guildId: string,
		permissions: ApplicationCommandPermissions[],
	) {
		if (!command.registeredId) return;
		return this.client.restApi.put(
			Routes.applicationCommandPermissions(
				this.client.config.clientId,
				guildId,
				command.registeredId,
			) as unknown as `/${string}`,
			{ body: { permissions } },
		);
	}

	private commandsToData(commands: Command[]) {
		return commands.map((command) => command.data.toJSON());
	}
}
