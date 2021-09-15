import BotClient from './client/BotClient';
import * as dotenv from 'dotenv';
import { join } from 'path';
dotenv.config({ path: join(__dirname, 'env.env') });

const client: BotClient = new BotClient({
  token: process.env.TOKEN,
  owners: process.env.OWNERS.split(","),
});
client.start();

export default client;
