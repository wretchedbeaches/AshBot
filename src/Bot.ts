import BotClient from './client/BotClient';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { Intents } from 'discord.js';
dotenv.config({ path: join(__dirname, '..', '.env') });

const client: BotClient = new BotClient({
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  owners: process.env.OWNERS.split(","),
}, {
  intents: [Intents.FLAGS.GUILDS]
});
client.start();

export default client;
