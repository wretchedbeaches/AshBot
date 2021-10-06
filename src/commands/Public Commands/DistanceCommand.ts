import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { getPreciseDistance } from 'geolib';
import config from '../../config.json';

export default class DistanceCommand extends Command {
  public constructor() {
    super('distance', {
      aliases: ['distance'],
      category: 'Utilities',
      description: {
        content:
          'Check the distance and associated softban cooldown time between two points.',
        usage: 'distance `latitude` `longitude` `latitude` `longitude`',
        examples: ['distance 41.63576 -0.90853 41.60914 -0.89437'],
      },
      ratelimit: 3,
      args: [
        {
          match: 'phrase',
          id: 'lat1',
          type: (_: Message, str: string): null | number => {
            const lat1 = parseFloat(str);
            if (isNaN(lat1) || lat1 < -90 || lat1 > 90) return null;
            return lat1;
          },
          prompt: {
            optional: false,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid first latitude value, which must be a number between -90 and 90`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid first laitude value, which must be a number between -90 and 90`,
          },
        },
        {
          match: 'phrase',
          id: 'lon1',
          type: (_: Message, str: string): null | number => {
            const lon1 = parseFloat(str);
            if (isNaN(lon1) || lon1 < -180 || lon1 > 180) return null;
            return lon1;
          },
          prompt: {
            optional: false,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid first longitude value, which must be a number between -180 and 180`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid first longitude value, which must be a number between -180 and 180`,
          },
        },
        {
          match: 'phrase',
          id: 'lat2',
          type: (_: Message, str: string): null | number => {
            const lat2 = parseFloat(str);
            if (isNaN(lat2) || lat2 < -90 || lat2 > 90) return null;
            return lat2;
          },
          prompt: {
            optional: false,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid second latitude value, which must be a number between -90 and 90`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid second latitude value, which must be a number between -90 and 90`,
          },
        },
        {
          match: 'phrase',
          id: 'lon2',
          type: (_: Message, str: string): null | number => {
            const lon2 = parseFloat(str);
            if (isNaN(lon2) || lon2 < -180 || lon2 > 180) return null;
            return lon2;
          },
          prompt: {
            optional: false,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid second longitude value, which must be a number between -180 and 180`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid second longitude value, which must be a number between -180 and 180`,
          },
        },
      ],
    });
  }

  public exec(message: Message, { lat1, lat2, lon1, lon2 }): Promise<Message> {
    const distance = getPreciseDistance(
      { latitude: lat1, longitude: lon1 },
      { latitude: lat2, longitude: lon2 }
    );
    let cooldownTime = 0;
    for (let i = 0; i < config.softbanCooldown.length - 1; i++) {
      const cooldown = config.softbanCooldown[i];
      const nextCooldown = config.softbanCooldown[i + 1];
      if (distance / 1000 >= cooldown[0] && distance / 1000 < nextCooldown[0]) {
        cooldownTime = cooldown[1];
        break;
      }
    }
    if (distance > config.softbanCooldown[0][0] && cooldownTime === 0)
      cooldownTime =
        config.softbanCooldown[config.softbanCooldown.length - 1][1];
    const embed = this.client.embed(message.guild.id).addFields({
      name: '__Calculated Distance__',
      value: `${distance > 1000 ? distance / 1000 : distance} ${
        distance > 1000 ? 'km' : 'm'
      }`,
    });
    if (cooldownTime > 0)
      embed.addFields({
        name: '__Cooldown Timer__',
        value: `${cooldownTime} minutes`,
      });
    return message.channel.send(embed);
  }
}
