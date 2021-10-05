import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { weather } from '../../rdmdbModels/weather';
import { FieldsEmbed } from 'discord-paginationembed';
import util from '../../util/util.json';
import sequelize, { Op } from 'sequelize';
import countryFlagEmoji from 'country-flag-emoji';
import nearbyCities from 'nearby-cities';
import { stripIndents } from 'common-tags';
import cities from 'all-the-cities';

export default class WeatherCommand extends Command {
  public constructor() {
    super('weather', {
      aliases: ['weather'],
      category: 'Search',
      description: {
        content: 'Search for weather by type or by coordinate.',
        usage: stripIndents`weather \`weather type\`
        
        **OR**
        
        weather \`lat\` \`lon\``,
        examples: ['weather sunny\nweather 35.482501 139.631672'],
      },
      ratelimit: 3,
      args: [
        {
          id: 'str',
          match: 'rest',
          type: 'string',
        },
      ],
    });
  }

  public async exec(message: Message, args): Promise<Message> {
    let embed, dbWeather;
    const errorEmbed = this.client
      .embed(message.guild.id)
      .setTitle('Invalid Argument(s)!')
      .setDescription(stripIndents`Please view valid argument examples below.
      
      Examples:
\`weather cloudy\` 
\`weather sunny\` 
\`weather windy\` 
\`weather rain\` 
\`weather fog\` 
\`weather partly cloudy\` 
\`weather snow\`

\`(Choose One)\`

**OR**

\`weather [lat] [lon]\`

**OR**

\`weather [city]\`

__**Example**__:
\`.weather 34.009033 -118.497279\``);
    try {
      if (
        args.str.split(' ').length === 2 &&
        !isNaN(parseFloat(args.str.split(' ')[0]))
      ) {
        const lat = parseFloat(args.str.split(' ')[0]);
        const lon = parseFloat(args.str.split(' ')[1]);
        const distance = sequelize.literal(
          `111.111 *
    DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${lat}))
         * COS(RADIANS(\`weather\`.\`latitude\`))
         * COS(RADIANS(${lon} - \`weather\`.\`longitude\`))
         + SIN(RADIANS(${lat}))
         * SIN(RADIANS(\`weather\`.\`latitude\`)))))`
        );
        dbWeather = await weather.findAll({
          order: distance,
          where: sequelize.where(distance, {
            [Op.lte]: parseInt(process.env.WEATHER_RADIUS),
          }),
          limit: parseInt(process.env.SEARCH_LIMIT),
        });
        embed = new FieldsEmbed();
        embed.embed = this.client
          .embed(message.guild.id)
          .setTitle(`Weather Near ${lat.toFixed(5)},${lon.toFixed(5)}`);
      } else if (
        Object.values(util.weather)
          .map((weather) => weather.name)
          .includes(args.str.toLowerCase())
      ) {
        const weatherId = Object.keys(util.weather).find(
          (id) => util.weather[id].name === args.str.toLowerCase()
        );
        dbWeather = await weather.findAll({
          where: {
            gameplay_condition: weatherId,
          },
          limit: parseInt(process.env.SEARCH_LIMIT),
        });
        embed = new FieldsEmbed();
        embed.embed = this.client
          .embed(message.guild.id)
          .setTitle(
            `${args.str.charAt(0).toUpperCase()}${args.str
              .substring(1)
              .toLowerCase()} Weather Locations`
          );
      } else {
        const city = cities.find(
          (city) => city.name.toLowerCase() === args.str.toLowerCase()
        );
        if (city) {
          // raw sql literal for distance between the latitude,longitude and a given pokemon's coordinates
          const distanceQueryString = `111.111 *
          DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${city.loc.coordinates[1]}))
               * COS(RADIANS(\`weather\`.\`latitude\`))
               * COS(RADIANS(${city.loc.coordinates[0]} - \`weather\`.\`longitude\`))
               + SIN(RADIANS(${city.loc.coordinates[1]}))
               * SIN(RADIANS(\`weather\`.\`latitude\`)))))`;
          const distance = sequelize.literal(distanceQueryString);
          dbWeather = await weather.findAll({
            order: distance,
            where: {
              [Op.and]: [
                sequelize.where(distance, {
                  [Op.lte]: parseInt(process.env.CITY_SEARCH_RADIUS),
                }),
              ],
            },
            limit: parseInt(process.env.SEARCH_LIMIT),
          });
          embed = new FieldsEmbed();
          embed.embed = this.client
            .embed(message.guild.id)
            .setTitle(`Weather Locations Near ${city.name}`);
        } else return message.channel.send(errorEmbed);
      }
      const fields = dbWeather.map((weather) => {
        const city = nearbyCities({
          latitude: weather.latitude,
          longitude: weather.longitude,
        })[0];
        const emoji = countryFlagEmoji.get(city.country);
        return {
          value: stripIndents`${emoji.emoji} ${city.name}, ${emoji.name}
[**[${weather.latitude.toFixed(5)},${weather.longitude.toFixed(
            5
          )}](https://www.google.com/maps?q=${weather.latitude},${
            weather.longitude
          })**]\n`,
        };
      });
      embed
        .setArray(
          fields.length > 0 ? fields : [{ value: 'No weather data found.' }]
        )
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel as TextChannel)
        .setPageIndicator(true)
        .setElementsPerPage(parseInt(process.env.FIELDS_LENGTH))
        .formatField('Weather', (el) => (el as any).value)
        .setTimeout(300000)
        .build();
    } catch (e) {
      console.log(e);
      message.channel.send(errorEmbed);
    }
  }
}
