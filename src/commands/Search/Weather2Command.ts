import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import axios from 'axios';
import { stripIndents } from 'common-tags';

export default class Weather2Command extends Command {
  public constructor() {
    super('weather2', {
      aliases: ['weather2'],
      category: 'Search',
      description: {
        content:
          'Search for the weather at a particular location using the Open Weather Map API.',
        usage: stripIndents`weather2 \`city name\`
        
        **OR**
        
        weather \`lat\` \`lon\``,
        examples: ['weather2 London\nweather2 35.482501 139.631672'],
      },
      args: [
        {
          id: 'str',
          match: 'rest',
          type: 'string',
        },
      ],
      ratelimit: 3,
    });
  }

  public async exec(message: Message, args: any) {
    let queryString, apiResponse;
    const errorEmbed = this.client
      .embed(message.guild.id)
      .setTitle('Invalid Argument(s)!')
      .setDescription(stripIndents`Please view valid argument examples below.
      
      Usage:
\`weather2 [lat] [lon]\`

**OR**

\`weather2 [city]\`

__**Example**__:
\`.weather2 34.009033 -118.497279\``);
    try {
      if (
        args.str.split(' ').length === 2 &&
        !isNaN(parseFloat(args.str.split(' ')[0]))
      ) {
        const lat = parseFloat(args.str.split(' ')[0]);
        const lon = parseFloat(args.str.split(' ')[1]);
        apiResponse = (
          await axios.get(
            `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}`
          )
        ).data;
        queryString = `${lat}, ${lon}`;
      } else {
        apiResponse = (
          await axios.get(
            `http://api.openweathermap.org/data/2.5/weather?q=${args.str}&units=metric&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}`
          )
        ).data;
        queryString = args.str;
      }
    } catch (e) {
      console.log(e);
      message.channel.send(errorEmbed);
    }

    const ctof = (celcius: number): number => celcius * (9 / 5) + 32;
    const embed = this.client
      .embed(message.guild.id)
      .setTitle(`${apiResponse.weather[0].main} in ${queryString}`)
      .setThumbnail(
        `http://openweathermap.org/img/w/${apiResponse.weather[0].icon}.png`
      )
      .addFields([
        {
          name: 'Description',
          value: apiResponse.weather[0].description,
          inline: true,
        },
        {
          name: 'Temperature',
          value: `${apiResponse.main.temp.toFixed(
            2
          )}°C (${apiResponse.main.temp_min.toFixed(2)}°C - ${
            apiResponse.main.temp_max
          }°C) (feels like ${apiResponse.main.feels_like.toFixed(2)}°C)\n${ctof(
            apiResponse.main.temp
          ).toFixed(2)}°F (${ctof(apiResponse.main.temp_min).toFixed(
            2
          )}°F - ${ctof(apiResponse.main.temp_max).toFixed(
            2
          )}°F) (feels like ${ctof(apiResponse.main.feels_like).toFixed(2)}°F)`,
        },
        {
          name: 'Wind',
          value: `${(apiResponse.wind.speed * 3.6).toFixed(2)} km/h\n${(
            apiResponse.wind.speed * 2.23694
          ).toFixed(2)} mph`,
        },
        {
          name: 'Pressure / Humidity',
          value: `${apiResponse.main.pressure.toFixed(
            2
          )} hPa / ${apiResponse.main.humidity.toFixed(2)}%`,
        },
      ]);
    return message.channel.send(embed);
  }
}
