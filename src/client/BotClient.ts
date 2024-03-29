import {
  AkairoClient,
  CommandHandler,
  ListenerHandler,
  InhibitorHandler,
} from 'discord-akairo';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { join } from 'path';
import { guild } from '../rdmdbModels/guild';
import { SequelizeProvider } from 'discord-akairo';
import { Sequelize } from 'sequelize';
import { initModels as initManualModels } from '../manualdbModels/init-models';
import { initModels } from '../rdmdbModels/init-models';
import puppeteer from 'puppeteer';
import { device } from '../rdmdbModels/device';
import axios from 'axios';
import config from '../config.json';

import express from 'express';
import cors from 'cors';
import hookRouter from '../routes/hook';
import ms from 'ms';
import { WebhookFilter } from '../models/WebhookFilters';
import { ReactionCollector } from 'discord.js';
const PORT = process.env.PORT || 8080;

declare module 'discord-akairo' {
  interface AkairoClient {
    commandHandler: CommandHandler;
    listenerHandler: ListenerHandler;
    inhibitorHandler: InhibitorHandler;
    settings: SequelizeProvider;
    embed(message: string): MessageEmbed;
    handleAdminPermissions(message: Message): boolean;
    handleModPermissions(message: Message): boolean;
    handleWebhookSet(message: Message, args: WebhookFilter): Promise<Message>;
    handleShinyReactions(message: Message, username: string): void;
    getEmoji(name: string): string;
    embedQueue: {};
    intervals: {};
    trains: {};
    nestMigrationDate: Date;
  }
}

interface BotOptions {
  token?: string;
  owners?: string | string[];
}

export default class BotClient extends AkairoClient {
  public config: BotOptions;
  public listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: join(__dirname, '..', 'listeners'),
  });
  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: join(__dirname, '..', 'commands'),
    prefix: (message) => {
      if (message.guild)
        return this.settings.get(
          message.guild.id,
          'prefix',
          process.env.BOT_PREFIX
        );
      return process.env.BOT_PREFIX;
    },
    allowMention: true,
    handleEdits: true,
    commandUtil: true,
    commandUtilLifetime: 3e5,
    defaultCooldown: 6e4,
    argumentDefaults: {
      prompt: {
        modifyStart: (_: Message, str: string): string =>
          `${str}\n\nType \`cancel\` to cancel the command...`,
        modifyRetry: (_: Message, str: string): string =>
          `${str}\n\nType \`cancel\` to cancel the command...`,
        timeout: 'command has now been cancelled...',
        ended:
          'command has now been cancelled...',
        retries: 3,
        time: 3e4,
      },
      otherwise: '',
    },
    ignorePermissions: process.env.OWNERS,
  });
  public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
    directory: join(__dirname, '..', 'inhibitors'),
  });

  public constructor(config: BotOptions) {
    super({ ownerID: config.owners });
    this.config = config;
    this.settings = new SequelizeProvider(guild, {
      idColumn: 'id',
      dataColumn: 'settings',
    });
    this.embedQueue = {};
    this.intervals = {};
    this.trains = {};
  }

  public embed(guildId: string): MessageEmbed {
    return new MessageEmbed()
      .setFooter(
        this.settings.get(guildId, 'footer', ''),
        this.settings.get(guildId, 'footerImage', '')
      )
      .setColor(this.settings.get(guildId, 'color', process.env.EMBED_COLOR));
  }

  public handleModPermissions(message: Message): boolean {
    const modRoleId = this.settings.get(message.guild.id, 'modRoleId', null);
    const adminRoleId = this.settings.get(
      message.guild.id,
      'adminRoleId',
      null
    );
    if (
      modRoleId &&
      !message.member.roles.cache.has(modRoleId) &&
      !message.member.roles.cache.has(adminRoleId)
    ) {
      message.reply(
        `You must have either the ${
          message.guild.roles.cache.get(modRoleId).name
        } role or ${
          message.guild.roles.cache.get(adminRoleId).name
        } role to use this command.`
      );
      return false;
    }
    return true;
  }

  public handleAdminPermissions(message: Message): boolean {
    const adminRoleId = this.settings.get(
      message.guild.id,
      'adminRoleId',
      null
    );
    if (adminRoleId && !message.member.roles.cache.has(adminRoleId)) {
      message.reply(
        `You must have the ${
          message.guild.roles.cache.get(adminRoleId).name
        } role to use this command.`
      );
      return false;
    }
    return true;
  }

  public async handleWebhookSet(message: Message, args: WebhookFilter) {
    if (args.rmchannel) {
      const settings = this.settings.get(message.guild.id, 'channels', {});
      delete settings[message.channel.id];
      await this.settings.set(message.guild.id, 'channels', settings);
      if (this.intervals[message.channel.id]) {
        clearInterval(this.intervals[message.channel.id]);
        delete this.intervals[message.channel.id];
        delete this.embedQueue[message.channel.id];
        delete this.trains[message.channel.id];
      }
      return message.util.send(
        `Successfully removed channel's ${args.type} webhook configuration.`
      );
    } else {
      const settings = this.settings.get(message.guild.id, 'channels', {});
      for (let arg in args)
        if (args[arg] === null || arg === 'rmchannel') delete args[arg];
      settings[message.channel.id] = args;
      await this.settings.set(message.guild.id, 'channels', settings);
      if (this.intervals[message.channel.id])
        clearInterval(this.intervals[message.channel.id]);
      this.embedQueue[message.channel.id] = [];
      this.intervals[message.channel.id] = setInterval(async () => {
        if (
          this.embedQueue[message.channel.id] &&
          this.embedQueue[message.channel.id].length > 0
        ) {
          let channel = this.channels.cache.get(message.channel.id);
          if (!channel) channel = await this.channels.fetch(message.channel.id);
          if (
            !((channel): channel is TextChannel => channel.type === 'text')(
              channel
            )
          )
            return;
          const embed = this.embedQueue[message.channel.id][0];
          const embedMessage = await channel.send({
            content: embed.coordinates
              ? `${embed.coordinates[0].toFixed(
                  5
                )}, ${embed.coordinates[1].toFixed(5)}`
              : embed.message,
            embed: embed.embed,
          });
          if (embed.shiny) this.handleShinyReactions(embedMessage, embed.user);
          this.embedQueue[message.channel.id] = this.embedQueue[
            message.channel.id
          ].slice(1, this.embedQueue[message.channel.id].length);
        }
      }, Number(process.env.QUEUE_INTERVAL));
      delete this.trains[message.channel.id];
      return message.util.send(
        `Successfully updated channel's ${args.type} webhook configuration.`
      );
    }
  }

  public async handleShinyReactions(message: Message, username: string) {
    await message.react('⏸');
    const reactionCollector = message.createReactionCollector(
      (reaction, user) => reaction.emoji.name === '⏸',
      {
        time: parseInt(process.env.SHINY_REACTION_TIMEOUT),
      }
    );
    reactionCollector.on('collect', async (reaction, user) => {
      if (user.id !== username.substring(2, username.length - 1))
        return user.send('This is not your device.');
      const devices = await device.findAll();
      let accountUsername;
      for (let account in config.shinyMentions) {
        if (
          config.shinyMentions[account].substring(
            2,
            config.shinyMentions[account].length - 1
          ) === user.id
        )
          accountUsername = account;
      }

      if (!accountUsername)
        return user.send('You do not have a device for the shiny service.');

      const targetDevice = devices.find(
        (device) => device.account_username === accountUsername
      );
      try {
        await axios.post(
          `http://www.ptamaps.xyz/dashboard/device/assign/${targetDevice.uuid}`,
          `instance=${process.env.SWITCH_INSTANCE_NAME}&_csrf=0AA6D511-B692-4FFC-8CBC-864976C43736`,
          {
            headers: {
              'Content-type': 'application/x-www-form-urlencoded',
              Referer: `http://www.ptamaps.xyz/dashboard/device/assign/${targetDevice.uuid}`,
              Cookie:
                'SESSION-TOKEN=BCE99912-8B42-43B3-8F09-8C26B23C5FAC; CSRF-TOKEN=0AA6D511-B692-4FFC-8CBC-864976C43736',
            },
          }
        );
      } catch (e) {
        console.log(`[Bot] Error with switching device ${targetDevice.uuid} instance`);
        reactionCollector.stop();
      }

      user.send(
        `Your device has been paused for **${ms(
          parseInt(process.env.SHINY_COLLECTION_DELAY),
          { long: true }
        )}** You can now collect your shiny pokemon.`
      );

      setTimeout(async () => {
        try {
          await axios.post(
            `http://www.ptamaps.xyz/dashboard/device/assign/${targetDevice.uuid}`,
            `instance=${targetDevice.instance_name}&_csrf=0AA6D511-B692-4FFC-8CBC-864976C43736`,
            {
              headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                Referer: `http://www.ptamaps.xyz/dashboard/device/assign/${targetDevice.uuid}`,
                Cookie:
                  'SESSION-TOKEN=BCE99912-8B42-43B3-8F09-8C26B23C5FAC; CSRF-TOKEN=0AA6D511-B692-4FFC-8CBC-864976C43736',
              },
            }
          );
        } catch (e) {
          console.log(`[Bot] Error with reverting device ${targetDevice.uuid} `);
          reactionCollector.stop();
          await message.reactions.removeAll();
        }
        user.send(
          `Your device has now been put back to the shiny pokemon collection instance.`
        );
        reactionCollector.stop();
      }, parseInt(process.env.SHINY_COLLECTION_DELAY));
      await message.reactions.removeAll();
    });

     reactionCollector.on('end', async (collected) => {
      await message.reactions.removeAll();
    });
  }

  public getEmoji(name: string): string {
    try {
      return this.emojis.cache.find((emoji) => emoji.name === name).toString();
    } catch (e) {
      return name;
    }
  }

  private async _init(): Promise<void> {
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      listenerHandler: this.listenerHandler,
      process,
    });

    const updateNestMigrationDate = async () => {
      try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(
          'https://p337.info/pokemongo/countdowns/?id=nest-migration'
        );
        await page.waitForSelector('#local_time3', {
          visible: true,
          timeout: 10000,
        });
        const nestMigrationDate = await page.evaluate(
          () => document.getElementById('local_time3').innerHTML
        );
        this.nestMigrationDate = new Date(nestMigrationDate);
        await browser.close();
      } catch (e) {
        console.log('[Bot] Error while attempting to grab nest migration date:', e);
      }
    };
    await updateNestMigrationDate();
    setInterval(() => {
      updateNestMigrationDate;
    }, parseInt(process.env.NEST_MIGRATION_UPDATE_TIME));

    this.commandHandler.loadAll();
    this.listenerHandler.loadAll();
    this.inhibitorHandler.loadAll();
    const rdmdb = new Sequelize(
      process.env.DATABASE,
      process.env.DATABASE_USERNAME,
      process.env.DATABASE_PASSWORD,
      {
        host: process.env.DATABASE_HOST,
        dialect: 'mysql',
        logging: false,
      }
    );
    const manualdb = new Sequelize(
      process.env.MANUAL_DATABASE,
      process.env.MANUAL_DATABASE_USERNAME,
      process.env.MANUAL_DATABASE_PASSWORD,
      {
        host: process.env.MANUAL_DATABASE_HOST,
        dialect: 'mysql',
        logging: false,
      }
    );
    initModels(rdmdb);
    initManualModels(manualdb);
    await rdmdb.sync();
    await manualdb.sync();
    console.log('[Bot] Connected to database');
    await this.settings.init();

  }

  private async initGuilds(): Promise<void> {
    for (let [guildId, { channels }] of this.settings.items) {
      for (let channelId in channels) {
        this.embedQueue[channelId] = [];
        this.intervals[channelId] = setInterval(async () => {
          if (
            this.embedQueue[channelId] &&
            this.embedQueue[channelId].length > 0
          ) {
            let channel = this.channels.cache.get(channelId);
            if (!channel) channel = await this.channels.fetch(channelId);
            if (
              !((channel): channel is TextChannel => channel.type === 'text')(
                channel
              )
            )
              return;
            const embed = await this.embedQueue[channelId][0];
            const embedMessage = await channel.send({
              content: embed.coordinates
                ? `${embed.coordinates[0].toFixed(
                    5
                  )}, ${embed.coordinates[1].toFixed(5)}`
                : embed.message,
              embed: embed.embed,
            });
            if (embed.shiny)
              this.handleShinyReactions(embedMessage, embed.user);
            this.embedQueue[channelId] = this.embedQueue[channelId].slice(
              1,
              this.embedQueue[channelId].length
            );
          }
        }, Number(process.env.QUEUE_INTERVAL));
      }
    }
  }

  private async initServer() {
    const app = express();
    app.use(express.json({ limit: '500mb' }));
    app.use(cors());
    app.use('/', hookRouter);

    app.listen(PORT, () => {
      console.log(`[Bot] Listening for webhooks on: http://localhost:${PORT}.`);
    });
  }

  public async start() {
    await this._init();
    await this.login(this.config.token);
    await this.initGuilds();
    await this.initServer();
  }
}
