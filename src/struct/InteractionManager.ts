import BaseClient from './BaseClient';
import BaseHandler from './BaseHandler';
import path from 'path';
import EventEmitter from 'events';
import {
	APIApplicationCommand,
	RESTPostAPIApplicationCommandsJSONBody,
	RESTPutAPIGuildApplicationCommandsPermissionsJSONBody,
	Routes,
} from 'discord-api-types/v9';
import Collection from '@discordjs/collection';
import { InteractionManagerEvents } from './Util';
import { Guild } from 'discord.js';

export type GuildPermissionResolver = (
	guild: Guild,
	registeredCommands: APIApplicationCommand[],
) =>
	| Promise<RESTPutAPIGuildApplicationCommandsPermissionsJSONBody>
	| RESTPutAPIGuildApplicationCommandsPermissionsJSONBody;

export default class InteractionManager extends EventEmitter {
	public client: BaseClient;
	public clientId: string;
	public directories: string[];
	public filterPath: null | ((path: string) => Promise<boolean>);
	public guildPermissions: null | GuildPermissionResolver;

	public interactions: Collection<string, RESTPostAPIApplicationCommandsJSONBody>;
	public registered: Set<string>;

	public constructor(client, { clientId, directories, filterPath, guildPermissions }) {
		super();
		this.client = client;
		this.clientId = clientId;
		this.directories = directories;
		this.filterPath = filterPath ?? null;
		this.interactions = new Collection();
		this.registered = new Set();
		this.guildPermissions = guildPermissions || null;
	}

	public async loadAll(directories = this.directories): Promise<InteractionManager> {
		let filepaths: string[] = [];
		for (const directory of directories) {
			filepaths = filepaths.concat(...BaseHandler.readdirRecursive(directory));
		}
		for (let filepath of filepaths) {
			filepath = path.resolve(filepath);
			if (this.filterPath === null || (await this.filterPath(filepath))) {
				try {
					const interaction = await import(filepath);
					this.interactions.set(filepath, interaction.default);
				} catch (error) {
					this.emit(InteractionManagerEvents.IMPORT_ERROR, { error, filepath });
				}
			}
		}
		return this;
	}

	public registerInteractions() {
		for (const guild of this.client.guilds.cache.values()) void this.registerInteractionForGuild(guild);
	}

	public async registerInteractionForGuild(guild: Guild) {
		const commandsForGuild: RESTPostAPIApplicationCommandsJSONBody[] = this.client.owners.includes(guild.ownerId)
			? Array.from(this.interactions.values())
			: Array.from(this.interactions.filter((_, key) => !key.toLowerCase().includes('owner')).values());
		return this.setGuildCommands(guild.id, commandsForGuild)
			.then(async (registeredCommands) => {
				this.registered.add(guild.id);
				if (this.guildPermissions !== null) {
					const guildCommandPermissions: RESTPutAPIGuildApplicationCommandsPermissionsJSONBody =
						await this.guildPermissions(guild, registeredCommands);
					return this.client.restApi
						.put(Routes.guildApplicationCommandsPermissions(this.clientId, guild.id) as unknown as `/${string}`, {
							body: guildCommandPermissions,
						})
						.then((registeredPermissions) => {
							this.emit(InteractionManagerEvents.PERMISSIONS_UPDATED, { guild, registeredPermissions });
							return registeredCommands;
						})
						.catch((error) => this.emit(InteractionManagerEvents.PERMISSION_ERROR, { guild, error }));
				}
				return registeredCommands;
			})
			.catch((error) => this.emit(InteractionManagerEvents.REGISTRATION_ERROR, { guild, error }));
	}

	public setGuildCommands(
		guildId: string,
		commands: RESTPostAPIApplicationCommandsJSONBody[],
	): Promise<APIApplicationCommand[]> {
		return this.client.restApi.put(Routes.applicationGuildCommands(this.clientId, guildId) as unknown as `/${string}`, {
			body: commands,
		}) as unknown as Promise<APIApplicationCommand[]>;
	}
}
