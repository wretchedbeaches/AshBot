import { REST } from '@discordjs/rest';
import { Client, ClientOptions, User } from 'discord.js';
import CommandHandler from './commands/CommandHandler';
import InhibitorHandler from './inhibitors/InhibitorHandler';
import ListenerHandler from './listeners/ListenerHandler';

export interface BaseClientOptions extends ClientOptions {
	owners?: string[];
	restToken: string;
}

export default class BaseClient extends Client {
	public owners: string[];
	public restApi: REST;
	public commandHandler!: CommandHandler;
	public listenerHandler!: ListenerHandler;
	public inhibitorHandler!: InhibitorHandler;

	public constructor(options: BaseClientOptions) {
		const { owners, restToken, ...clientOptions } = options;
		super(clientOptions);
		this.owners = owners ?? [];
		this.restApi = new REST({ version: '9' }).setToken(restToken);
	}

	public async init() {
		this.listenerHandler.setEmitters({
			listenerHandler: this.listenerHandler,
			inhibitorHandler: this.inhibitorHandler,
			commandHandler: this.commandHandler,
			client: this,
			process,
		});
		if (this.commandHandler.cooldownManager !== null)
			this.listenerHandler.emitters.set('cooldownManager', this.commandHandler.cooldownManager);
		await this.listenerHandler.loadAll();
		await this.inhibitorHandler.loadAll();
		await this.commandHandler.useListenerHandler(this.listenerHandler);
		await this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		await this.commandHandler.loadAll();
	}

	public isOwner(user: User) {
		return this.owners.includes(user.id);
	}
}
