import AshBot from './client/BotClient';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { Intents } from 'discord.js';
dotenv.config({ path: join(__dirname, '..', '.env') });

const client: AshBot = new AshBot(
	{
		token: process.env.TOKEN ?? '',
		clientId: process.env.CLIENT_ID ?? '',
		owners: (process.env.OWNERS ?? '').split(','),
	},
	{
		restToken: process.env.TOKEN ?? '',
		intents: [Intents.FLAGS.GUILDS],
	},
);
void client.start();

export default client;
