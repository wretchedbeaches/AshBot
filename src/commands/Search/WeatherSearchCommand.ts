import { CommandInteraction, MessageEmbed } from 'discord.js';
import { weather } from '../../rdmdbModels/weather';
import sequelize, { Op } from 'sequelize';
import { stripIndents } from 'common-tags';
import cities from 'all-the-cities';
import BaseSearchCommand from './BaseSearchCommand';
import { weatherData } from '../../data/Data';
import { Literal } from 'sequelize/types/lib/utils';
import { parseWeatherDb } from '../../util/parse';
import { ButtonPaginator } from '@psibean/discord.js-pagination';
import COMMAND_NAMES from '../../util/CommandNames';

export default class WeatherSearchCommand extends BaseSearchCommand {
	public constructor() {
		super(COMMAND_NAMES.SEARCH.WEATHER, {
			description: {
				content: 'Search for weather by type or by coordinate.',
				usage: stripIndents`weather \`weather type\`
        
        **OR**
        
        weather \`lat\` \`lon\``,
				examples: ['weather sunny\nweather 35.482501 139.631672'],
			},
		});
	}

	public async execute(interaction: CommandInteraction) {
		const weatherArgument = interaction.options.getString('weather', false);
		const cityArgument = interaction.options.getString('city', false);
		const latitudeArgument = interaction.options.getNumber('latitude', false);
		const longitudeArgument = interaction.options.getNumber('longitude', false);
		const weatherFilters: any = { where: {} };
		let distanceQuery: Literal | null = null;
		let hasFailed = true;
		let title = 'Unable to resolve a title';
		if (weatherArgument !== null) {
			if (weatherData[weatherArgument]) {
				const weatherObj = weatherData[weatherArgument];
				weatherFilters.where['gameplay_condition'] = weatherObj!.id;
				hasFailed = false;
				title = `${weatherArgument.charAt(0).toUpperCase()}${weatherArgument
					.substring(1)
					.toLowerCase()} Weather Locations`;
			}
		}

		if (hasFailed && cityArgument !== null) {
			hasFailed = false;
			const city = cities.find((city) => city.name.toLowerCase() === cityArgument.toLowerCase());
			if (city) {
				distanceQuery = WeatherSearchCommand.getDistanceQuery('weather', {
					lat: city.loc.coordinates[0],
					long: city.loc.coordinates[1],
				})!;
				weatherFilters.order = distanceQuery;
				weatherFilters.where = {
					[Op.and]: [
						sequelize.where(distanceQuery, {
							[Op.lte]: parseInt(process.env.CITY_SEARCH_RADIUS!, 10),
						}),
					],
				};
				title = `Weather Locations Near ${city.name as string}`;
				// embed.embed = this.client.embed(message.guild.id).setTitle(`Weather Locations Near ${city.name}`);
			} else {
				return interaction.editReply(`The provided city name '${cityArgument}' doesn't appear to be a valid city.`);
			}
		}

		if (hasFailed && latitudeArgument !== null && longitudeArgument !== null) {
			hasFailed = false;
			distanceQuery = WeatherSearchCommand.getDistanceQuery('weather', {
				lat: latitudeArgument,
				long: longitudeArgument,
			})!;
			weatherFilters.order = distanceQuery;
			weatherFilters.where = sequelize.where(distanceQuery, {
				[Op.lte]: parseInt(process.env.WEATHER_RADIUS!, 10),
			});
			title = `Weather Near ${latitudeArgument.toFixed(5)},${longitudeArgument.toFixed(5)}`;
		}

		if (hasFailed) {
			let error = `Weather search command was unable to process the provided arguments.\n The following arguments were providd:`;
			if (weatherArgument) error += `\n**weather**L ${weatherArgument}`;
			if (cityArgument) error += `\n**city**: ${cityArgument}`;
			error += `\n**lat/long**: `;
			error += latitudeArgument === null ? '<none>/' : `${latitudeArgument}/`;
			error += longitudeArgument === null ? `<none>` : `${longitudeArgument}`;
			error += `\n\nYou must ptovide a valid weather, a valid city, OR both a latitude and longitude.`;
			return interaction.editReply(error);
		}

		const dbWeather = await weather.findAll({
			...weatherFilters,
			limit: parseInt(process.env.SEARCH_LIMIT!, 10),
		});
		const weatherCount = dbWeather.length;
		const fieldLength = parseInt(process.env.FIELDS_LENGTH ?? '6', 10);
		const maxPages = weatherCount / fieldLength + (weatherCount % fieldLength > 0 ? 1 : 0);
		const pages: MessageEmbed[] = [];
		for (let i = 0; i < maxPages; i++) {
			const embed = this.client.embed(interaction.guildId);
			const sliceStart = i * fieldLength;
			const sliceEnd = sliceStart + fieldLength > weatherCount ? weatherCount : sliceStart + fieldLength;
			embed.setTitle(title);
			embed.setDescription(
				`**Weather**\n${dbWeather
					.slice(sliceStart, sliceEnd)
					.map((weatherValue) => parseWeatherDb(weatherValue))
					.join()
					.trim()}`,
			);
			pages.push(embed);
		}
		const messageOptionsResolver = ({ newIdentifiers, paginator }: { newIdentifiers; paginator: ButtonPaginator }) => {
			return {
				content: `Page ${(newIdentifiers.pageIdentifier as number) + 1}/${paginator.maxNumberOfPages as number}`,
			};
		};

		const buttonPaginator = new ButtonPaginator(interaction, {
			pages,
			messageOptionsResolver,
			maxNumberOfPages: maxPages,
		});
		return buttonPaginator.send();
	}
}
