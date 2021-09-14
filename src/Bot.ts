import BotClient from './client/BotClient';

const client: BotClient = new BotClient({
  token: process.env.TOKEN,
  owners: process.env.OWNERS,
});
client.start();

export default client;
