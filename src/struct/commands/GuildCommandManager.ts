import { APIApplicationCommand, Routes, Snowflake } from 'discord-api-types/v9';
import { ApplicationCommandPermissions, Collection, Guild, GuildApplicationCommandPermissionData } from 'discord.js';
import BaseClient from '../../client/BotClient';
import Command from './Command';

export default class GuildCommandManager {
	public guild: Guild;
	public client: BaseClient;
	public commands: Collection<string, string>;

	public constructor(client: BaseClient, guild: Guild) {
		this.client = client;
		this.guild = guild;
		this.commands = new Collection();
	}

	public async init(commands: Collection<string, Command>) {
		const registeredGuildCommands = await this.getGuildCommands();
		for (const command of registeredGuildCommands) {
			if (commands.has(command.name)) this.commands.set(command.name, command.id);
			else await this.deleteGuildCommand(command.name, command.id);
		}

		const commandsToRegister = commands.filter((_, key) => {
			return !registeredGuildCommands.some((val) => val.name === key);
		});
		for (const commandToRegister of commandsToRegister.values()) {
			await this.createGuildCommand(commandToRegister);
		}
	}

	public getGuildCommands(): Promise<APIApplicationCommand[]> {
		return this.client.restApi.get(
			Routes.applicationGuildCommands(this.client.config.clientId, this.guild.id) as unknown as `/${string}`,
		) as Promise<APIApplicationCommand[]>;
	}

	public createGuildCommand(command: Command) {
		return (
			this.client.restApi.post(
				Routes.applicationGuildCommands(this.client.config.clientId, this.guild.id) as unknown as `/${string}`,
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
		console.log(`Updating: ${this.commands.get(command.id) ?? 'unknown'}`);
		if (this.commands.has(command.id))
			return this.client.restApi.post(
				Routes.applicationGuildCommands(this.client.config.clientId, this.guild.id) as unknown as `/${string}`,
				{ body: command.data.toJSON() },
			) as Promise<APIApplicationCommand>;
	}

	public setGuildCommands(commands: Command[]) {
		return this.client.restApi.put(
			Routes.applicationGuildCommands(this.client.config.clientId, this.guild.id) as unknown as `/${string}`,
			{ body: this.commandsToData(commands) },
		);
	}

	public deleteGuildCommand(name: string, registeredId: string) {
		return this.client.restApi
			.delete(
				Routes.applicationGuildCommand(
					this.client.config.clientId,
					this.guild.id,
					registeredId,
				) as unknown as `/${string}`,
			)
			.then((response) => {
				this.commands.delete(name);
				return response;
			});
	}

	// TODO: Permission based calls - may need to update Command class types.
	public getAllGuildCommandPermissions(): Promise<GuildApplicationCommandPermissionData[]> {
		return this.client.restApi.get(
			Routes.guildApplicationCommandsPermissions(this.client.config.clientId, this.guild.id) as unknown as `/${string}`,
		) as Promise<GuildApplicationCommandPermissionData[]>;
	}

	public getGuildCommandPermissions(command: Command) {
		if (!command.registeredId) return;
		return this.client.restApi.get(
			Routes.applicationCommandPermissions(
				this.client.config.clientId,
				this.guild.id,
				command.registeredId,
			) as unknown as `/${string}`,
		);
	}

	public setGuildCommandPermissions(
		registeredId: string,
		permissions: { id: Snowflake; type: 2; permission: boolean }[],
	) {
		return this.client.restApi.put(
			Routes.applicationCommandPermissions(
				this.client.config.clientId,
				this.guild.id,
				registeredId,
			) as unknown as `/${string}`,
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

	public async updateOwnerOnlyCommandPermissions(ownerCommands: IterableIterator<Command>, ownerId: string) {
		const ownerGuildPermissions = await this.getAllGuildCommandPermissions();
		for (const ownerCommand of ownerCommands) {
			if (this.commands.has(ownerCommand.id)) {
				const ownerCommandPermissions = ownerGuildPermissions.find((val) => val.id === ownerCommand.registeredId);
				// If there are no existing permissions, or the owner id doesn't match on the existing permission
				// Update the commands permission for the guild.
				if (!ownerCommandPermissions || !ownerCommandPermissions.permissions.some((val) => val.id === ownerId)) {
					const registeredId = this.commands.get(ownerCommand.id)!;
					await this.setGuildCommandPermissions(registeredId, [{ id: ownerId, type: 2, permission: true }]);
				}
			}
		}
	}

	private commandsToData(commands: Command[]) {
		return commands.map((command) => command.data.toJSON());
	}
}
