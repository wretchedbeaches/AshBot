import BotClient from './client/BotClient';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, 'env.env') });

const client: BotClient = new BotClient({
  token: process.env.TOKEN,
  owners: process.env.OWNERS,
});
client.start();

export default client;
