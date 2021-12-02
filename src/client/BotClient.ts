import axios from 'axios';
import cheerio from 'cheerio';
import { Collection, Guild, GuildEmoji, MessageEmbed, User } from 'discord.js';
import { REST } from '@discordjs/rest';
import CommandHandler from '../struct/commands/CommandHandler';
import ListenerHandler from '../struct/listeners/ListenerHandler';
import SequelizeProvider from '../util/SequelizeProvider';
import { Dialect, Sequelize } from 'sequelize';
import { initModels as initManualModels } from '../manualdbModels/init-models';
import { initModels } from '../rdmdbModels/init-models';
import { guild } from '../rdmdbModels/guild';
import { join } from 'path';
import express, { RequestHandler } from 'express';
import hookRouter from '../routes/hook';
import cors from 'cors';
import CooldownManager from '../struct/commands/CooldownManager';
import LogManager from '../util/LogManager';
import BaseClient, { BaseClientOptions } from '../struct/BaseClient';
import RankingDataManager from '../util/RankingDataManager';
import InteractionManager from '../struct/InteractionManager';
import {
	ApplicationCommandPermissionType,
	RESTPutAPIGuildApplicationCommandsPermissionsJSONBody,
} from 'discord-api-types';

interface BotConfig {
	token: string;
	clientId: string;
	owners: string[];
}

export interface ChannelEmbed {
	coordinates?: number[];
	embed: MessageEmbed;
	message?: string;
	shiny?: boolean;
	user?: User;
}

export default class AshBot extends BaseClient {
	public config: BotConfig;
	public nestMigrationDate?: Date;
	public settings: SequelizeProvider;
	public embedQueue: Collection<string, ChannelEmbed[]>;
	public intervals: Collection<string, NodeJS.Timeout>;
	public trains: Collection<string, { longitude: number; latitude: number }>;
	public logger: LogManager;
	public rankingData: RankingDataManager;

	public constructor(config: BotConfig, options: BaseClientOptions) {
		super({ ...options });
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
			directories: [join(__dirname, '..', 'commands', 'Search'), join(__dirname, '..', 'commands', 'Public Commands')],
			cooldownManager: new CooldownManager(this, { defaultCooldown: 6e4 }),
			filterPath: (path) => !path.toLowerCase().includes('base'),
		});

		this.interactionManager = new InteractionManager(this, {
			clientId: this.config.clientId,
			directories: [
				join(__dirname, '..', 'interactions', 'Search'),
				join(__dirname, '..', 'interactions', 'Public Commands'),
			],
			filterPath: (path) => !path.toLowerCase().includes('base'),
			guildPermissions: async (guild: Guild, registeredCommands: any) => {
				const guildCommandPermissions: RESTPutAPIGuildApplicationCommandsPermissionsJSONBody = [];
				for (const command of registeredCommands) {
					const commandPermissions: any = {
						id: command.id,
						permissions: [],
					};
					commandPermissions.permissions.push({
						id: guild.ownerId,
						type: ApplicationCommandPermissionType.User,
						permission: true,
					});
					const adminRoleId = this.settings.get(guild.id, 'adminRoleId', null);
					if (adminRoleId !== null) {
						const adminRole = await guild.roles.fetch(adminRoleId);
						if (adminRole)
							commandPermissions.permissions.push({
								id: adminRole.id,
								type: ApplicationCommandPermissionType.Role,
								permission: true,
							});
						else await this.settings.delete(guild.id, 'adminRoleId');
					}
					guildCommandPermissions.push(commandPermissions);
				}
				return guildCommandPermissions;
			},
		});

		this.settings = new SequelizeProvider(guild, {
			idColumn: 'id',
			dataColumn: 'settings',
		});
		this.rankingData = new RankingDataManager(this);
	}

	private async _init(): Promise<void> {
		await super.init();
		await this.rankingData.init();
		await this.updateNestMigrationDate();
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		setInterval(this.updateNestMigrationDate, parseInt(process.env.NEST_MIGRATION_UPDATE_TIME!, 10));

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
			this.logger.info('[Bot] Updating nest migration date...');
			const nestMigrationRequest = (await axios.get(`https://p337.info/pokemongo/countdowns/?id=nest-migration`)).data;
			const $ = cheerio.load(nestMigrationRequest as string);
			const nestMigrationDate = $('#local_time3').text().trim();
			this.nestMigrationDate = new Date(nestMigrationDate);
			this.logger.info(`[Bot] Nest migration date updated to ${this.nestMigrationDate.toString()}`);
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
		this.logger.info('[Bot] Initialising guilds...');
		for (const [_, { channels }] of this.settings.items) {
			for (const channelId in channels) {
				if (!channels.hasOwnProperty(channelId)) continue;
				if (!this.embedQueue.has(channelId)) this.embedQueue.set(channelId, []);
				try {
					this.setInterval(channelId);
				} catch (error) {
					this.logger.error(error);
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
							if (channel?.isText() && this.embedQueue.has(channelId)) {
								const channelQueue: ChannelEmbed[] = this.embedQueue.get(channelId)!;
								const embed = channelQueue.shift();
								if (embed) {
									channel
										.send({
											content: embed.coordinates
												? `${embed.coordinates[0].toFixed(5)}, ${embed.coordinates[1].toFixed(5)}`
												: embed.message,
											embeds: [embed.embed],
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
		this.logger.info('[Bot] Starting express server...');
		const PORT = process.env.PORT ?? 8080;
		const app = express();
		app.use(express.json({ limit: '2048kb' }) as RequestHandler);
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
}
