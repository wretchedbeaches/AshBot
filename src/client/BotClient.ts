import { Client, ClientOptions, Collection, GuildEmoji, MessageEmbed, User } from 'discord.js';
import { REST } from '@discordjs/rest';
import CommandHandler from '../struct/commands/CommandHandler';
import InhibitorHandler from '../struct/inhibitors/InhibitorHandler';
import ListenerHandler from '../struct/listeners/ListenerHandler';
import SequelizeProvider from '../util/SequelizeProvider';
import { Dialect, Sequelize } from 'sequelize';
import { initModels as initManualModels } from '../manualdbModels/init-models';
import { initModels } from '../rdmdbModels/init-models';
import puppeteer from 'puppeteer';
// import { device } from '../rdmdbModels/device';
import { guild } from '../rdmdbModels/guild';
import { join } from 'path';
// import { WebhookFilter } from '../models/WebhookFilters';
import express from 'express';
import hookRouter from '../routes/hook';
import cors from 'cors';
import CooldownManager from '../struct/commands/CooldownManager';
import LogManager from '../util/LogManager';

interface BotConfig {
	token: string;
	clientId: string;
	owners: string[];
}

export interface BaseClientAttributes extends Client {
	config: BotConfig;
	owners: string[];
	restApi: REST;
	commandHandler: CommandHandler;
	listenerHandler: ListenerHandler;
	inhibitorHandler: InhibitorHandler;
	isOwner(user: User): boolean;
}

export interface ChannelEmbed {
	coordinates?: number[];
	embed: MessageEmbed;
	message?: string;
	shiny?: boolean;
	user?: User;
}

export default class BaseClient extends Client implements BaseClientAttributes {
	public owners: string[];
	public config: BotConfig;
	public restApi: REST;
	public commandHandler: CommandHandler;
	public listenerHandler: ListenerHandler;
	public inhibitorHandler: InhibitorHandler;
	public nestMigrationDate: Date;
	public settings: SequelizeProvider;
	public embedQueue: Collection<string, ChannelEmbed[]>;
	public intervals: Collection<string, NodeJS.Timeout>;
	public trains: Collection<string, { longitude: number; latitude: number }>;
	public logger: LogManager;

	public constructor(config: BotConfig, options: ClientOptions) {
		super(options);
		this.logger = new LogManager(this);
		this.config = config;
		this.owners = config.owners;
		this.restApi = new REST({ version: '9' }).setToken(config.token);
		this.embedQueue = new Collection();
		this.intervals = new Collection();
		this.trains = new Collection();

		this.listenerHandler = new ListenerHandler(this, {
			directories: [join(__dirname, '..', 'listeners')],
		});

		this.commandHandler = new CommandHandler(this, {
			directories: [join(__dirname, '..', 'commands/Public Commands')],
			cooldownManager: new CooldownManager(this, { defaultCooldown: 6e4 }),
			filterPath: (path) => !path.toLowerCase().includes('base'),
		});
		this.inhibitorHandler = new InhibitorHandler(this, {
			directories: [join(__dirname, '..', 'inhibitors')],
		});

		this.settings = new SequelizeProvider(guild, {
			idColumn: 'id',
			dataColumn: 'settings',
		});
	}

	private async _init(): Promise<void> {
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler,
			process,
		});
		if (this.commandHandler.cooldownManager !== undefined)
			this.listenerHandler.emitters.set('cooldownManager', this.commandHandler.cooldownManager);
		await this.listenerHandler.loadAll();
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);

		await this.updateNestMigrationDate();
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		setInterval(this.updateNestMigrationDate, parseInt(process.env.NEST_MIGRATION_UPDATE_TIME!, 10));

		await this.commandHandler.loadAll();
		await this.inhibitorHandler.loadAll();
		const dbDialect: Dialect = (process.env.DATABASE_DIALECT ?? 'mysql') as Dialect;
		const rdmdb = new Sequelize(
			process.env.DATABASE as string,
			process.env.DATABASE_USERNAME as string,
			process.env.DATABASE_PASSWORD as string,
			{
				host: process.env.DATABASE_HOST,
				dialect: dbDialect,
				logging: false,
			},
		);
		const manualdb = new Sequelize(
			process.env.MANUAL_DATABASE!,
			process.env.MANUAL_DATABASE_USERNAME!,
			process.env.MANUAL_DATABASE_PASSWORD,
			{
				host: process.env.MANUAL_DATABASE_HOST,
				dialect: dbDialect,
				logging: false,
			},
		);
		initModels(rdmdb);
		initManualModels(manualdb);
		await rdmdb.sync();
		await manualdb.sync();
		this.logger.info('[Bot] Connected to database');
		await this.settings.init();
	}

	public async updateNestMigrationDate() {
		try {
			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			await page.goto('https://p337.info/pokemongo/countdowns/?id=nest-migration');
			await page.waitForSelector('#local_time3', {
				visible: true,
				timeout: 10000,
			});
			const nestMigrationDate = await page.evaluate(() => document.getElementById('local_time3')?.innerHTML);
			this.nestMigrationDate = new Date(nestMigrationDate!);
			await browser.close();
		} catch (e) {
			this.logger.error(`[Bot] Error while attempting to grab nest migration date: \n\n${e as string}\n\n`);
		}
	}

	public async start() {
		await this._init();
		await this.login(this.config.token);
		await this.initGuilds();
		await this.initServer();
	}

	public embed(guildId?: string | null): MessageEmbed {
		return new MessageEmbed()
			.setFooter(this.settings.get(guildId, 'footer', ''), this.settings.get(guildId, 'footerImage', ''))
			.setColor(this.settings.get(guildId, 'color', process.env.EMBED_COLOR));
	}

	private initGuilds(): void {
		for (const [_, { channels }] of this.settings.items) {
			for (const channelId in channels) {
				if (!channels.prototype.hasOwnProperty(channelId)) continue;
				if (!this.embedQueue.has(channelId)) this.embedQueue.set(channelId, []);
				try {
					this.setInterval(channelId);
				} catch (error) {
					console.log(error);
				}
			}
		}
	}

	public setInterval(channelId: string) {
		this.intervals.set(
			channelId,
			setInterval(() => {
				if (this.embedQueue.has(channelId) && this.embedQueue.get(channelId)!.length > 0) {
					// fetch checks cache first already
					this.channels
						.fetch(channelId)
						.then((channel) => {
							if (channel?.isText()) {
								if (this.embedQueue.has(channelId)) {
									const channelQueue: ChannelEmbed[] = this.embedQueue.get(channelId)!;
									const embed = channelQueue[0];
									channel
										.send({
											content: embed.coordinates
												? `${embed.coordinates[0].toFixed(5)}, ${embed.coordinates[1].toFixed(5)}`
												: embed.message,
											embeds: [embed.embed],
										})
										.then((_) => {
											// if (embed.shiny) this.handleShinyReactions(embedMessage, embed.user);
											this.embedQueue.set(channelId, channelQueue.slice(1, channelQueue.length));
										})
										.catch((error) => this.logger.error(error));
								}
							}
						})
						.catch((error) => this.logger.error(error));
				}
			}, Number(process.env.QUEUE_INTERVAL)),
		);
	}

	private initServer() {
		const PORT = process.env.PORT ?? 8080;
		const app = express();
		app.use(express.json({ limit: '500mb' }));
		app.use(cors());
		app.use('/', hookRouter);

		app.listen(PORT, () => {
			this.logger.info(`[Bot] Listening for webhooks on: http://localhost:${PORT}.`);
		});
	}

	public getEmoji(name: string): string | GuildEmoji {
		const emoji = this.emojis.cache.find((emoji) => emoji.name === name);
		if (emoji instanceof GuildEmoji) return emoji;
		return name;
	}

	// public async handleWebhookSet(interaction: CommandInteraction, args: WebhookFilter) {
	//   const channelId = interaction.channel.id;
	//   const guildId = interaction.guild.id;
	//   if (args.rmchannel) {
	//     const settings = this.settings.get(guildId, 'channels', {});
	//     delete settings[channelId];
	//     await this.settings.set(channelId, 'channels', settings);
	//     if (this.intervals[channelId]) {
	//       clearInterval(channelId);
	//       delete this.intervals[channelId];
	//       delete this.embedQueue[channelId];
	//       delete this.trains[channelId];
	//     }
	//     return interaction.editReply(
	//       `Successfully removed channel's ${args.type} webhook configuration.`
	//     );
	//   } else {
	//     const settings = this.settings.get(guildId, 'channels', {});
	//     for (let arg in args)
	//       if (args[arg] === null || arg === 'rmchannel') delete args[arg];
	//     settings[channelId] = args;
	//     await this.settings.set(channelId, 'channels', settings);
	//     if (this.intervals[channelId])
	//       clearInterval(this.intervals[channelId]);
	//     this.embedQueue[channelId] = [];
	//     this.intervals[channelId] = setInterval(async () => {
	//       if (
	//         this.embedQueue[channelId] &&
	//         this.embedQueue[channelId].length > 0
	//       ) {
	//         const embed = this.embedQueue[message.channel.id][0];
	//         const embedMessage = await channel.send({
	//           content: embed.coordinates
	//             ? `${embed.coordinates[0].toFixed(
	//                 5
	//               )}, ${embed.coordinates[1].toFixed(5)}`
	//             : embed.message,
	//           embeds: embed.embed,
	//         });
	//         if (embed.shiny) this.handleShinyReactions(embedMessage, embed.user);
	//         this.embedQueue[message.channel.id] = this.embedQueue[
	//           message.channel.id
	//         ].slice(1, this.embedQueue[message.channel.id].length);
	//       }
	//     }, Number(process.env.QUEUE_INTERVAL));
	//     delete this.trains[message.channel.id];
	//     return message.util.send(
	//       `Successfully updated channel's ${args.type} webhook configuration.`
	//     );
	//   }
	// }

	public isOwner(user) {
		return this.owners.includes(user.id);
	}
}
