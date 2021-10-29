import { CommandInteraction } from 'discord.js';
import axios from 'axios';
import { stripIndents } from 'common-tags';
import Command from '../../struct/commands/Command';
import { WeatherApiData, WeatherApiDataError } from '../../data/DataTypes';

export default class Weather2Command extends Command {
	private readonly mapApiKey: string;

	public constructor() {
		super('weather2', {
			category: 'Search',
			description: {
				content: 'Search for the weather at a particular location using the Open Weather Map API.',
				usage: stripIndents`weather2 \`city name\`
        
        **OR**
        
        weather \`lat\` \`lon\``,
				examples: ['weather2 London\nweather2 35.482501 139.631672'],
			},
			rateLimit: 3,
		});
		this.mapApiKey = process.env.OPEN_WEATHER_MAP_API_KEY ?? '';
	}

	public async execute(interaction: CommandInteraction) {
		const city = interaction.options.getString('city', false);
		const latitude = interaction.options.getNumber('latitude', false);
		const longitude = interaction.options.getNumber('longitude', false);
		if (city === null && (latitude === null || longitude === null))
			return interaction.editReply(stripIndents`
        Please provide either a city or both a latitude and longitude to search.
      
        Usage:
        \`weather2 [lat] [lon]\`

        **OR**

        \`weather2 [city]\`

        __**Example**__:
        \`.weather2 34.009033 -118.497279\``);
		let queryString: string;
		let apiResponse: WeatherApiData | WeatherApiDataError | undefined;
		try {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (city !== null) {
				queryString = city;
				apiResponse = (
					await axios.get(
						`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${this.mapApiKey}`,
					)
				).data as WeatherApiData | WeatherApiDataError;
			} else if (latitude !== null && longitude !== null) {
				queryString = `${latitude}, ${longitude}`;
				apiResponse = (
					await axios.get(
						`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${this.mapApiKey}`,
					)
				).data as WeatherApiData | WeatherApiDataError;
			}
			if (apiResponse === undefined || 'message' in apiResponse) {
				return interaction.editReply(`There was an error trying to find the weather data for '${queryString!}'`);
			}

			const ctof = (celcius: number): number => celcius * (9 / 5) + 32;
			const embed = this.client
				.embed(interaction.guildId)
				.setTitle(`${apiResponse.weather[0].main} in ${queryString!}`)
				.setThumbnail(`http://openweathermap.org/img/w/${apiResponse.weather[0].icon}.png`)
				.addFields([
					{
						name: 'Description',
						value: apiResponse.weather[0].description,
						inline: true,
					},
					{
						name: 'Temperature',
						value: `${apiResponse.main.temp.toFixed(2)}°C (${apiResponse.main.temp_min.toFixed(2)}°C - ${
							apiResponse.main.temp_max
						}°C) (feels like ${apiResponse.main.feels_like.toFixed(2)}°C)\n${ctof(apiResponse.main.temp).toFixed(
							2,
						)}°F (${ctof(apiResponse.main.temp_min).toFixed(2)}°F - ${ctof(apiResponse.main.temp_max).toFixed(
							2,
						)}°F) (feels like ${ctof(apiResponse.main.feels_like).toFixed(2)}°F)`,
					},
					{
						name: 'Wind',
						value: `${(apiResponse.wind.speed * 3.6).toFixed(2)} km/h\n${(apiResponse.wind.speed * 2.23694).toFixed(
							2,
						)} mph`,
					},
					{
						name: 'Pressure / Humidity',
						value: `${apiResponse.main.pressure.toFixed(2)} hPa / ${apiResponse.main.humidity.toFixed(2)}%`,
					},
				]);
			return interaction.editReply({ embeds: [embed] });
		} catch (error) {
			this.client.logger.error(`There was an error retrieving weather API data.`, {
				command: this.id,
				user: interaction.user.id,
				error,
			});
			return interaction.editReply(`An error occurred retrieving weather data for ${queryString!}`);
		}
	}
}
