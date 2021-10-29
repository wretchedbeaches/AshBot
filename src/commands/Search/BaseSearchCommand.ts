import sequelize from 'sequelize';
import Command, { CommandOptions } from '../../struct/commands/Command';
import config from '../../config.json';
import { CommandInteraction } from 'discord.js';

export default class BaseSearchCommand extends Command {
	public static getDistanceQuery(type: string, center: { lat: number; long: number } | null) {
		if (center === null) return null;
		return sequelize.literal(
			`111.111 *
  DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${center.lat}))
        * COS(RADIANS(\`${type}\`.\`lat\`))
        * COS(RADIANS(${center.long} - \`pokestop\`.\`lon\`))
        + SIN(RADIANS(${center.lat}))
        * SIN(RADIANS(\`${type}\`.\`lat\`)))))`,
		);
	}

	public static getWithinCityQuery(type: string, city: string | null) {
		if (city === null) return null;
		return sequelize.literal(`ST_CONTAINS(ST_GEOMFROMTEXT(
      'POLYGON((${
				config.cities[city].map((coord: [number, number]) => `${coord[1]} ${coord[0]}`).join(', ') as string
			}))'), POINT(\`${type}\`.\`lon\`, \`${type}\`.\`lat\`))`);
	}

	public constructor(id, options: CommandOptions) {
		super(id, { ...options, category: 'Search', rateLimit: 3, cooldown: 3e5 });
	}

	public parseCommonArgs(interaction: CommandInteraction) {
		const subcommand = interaction.options.getSubcommand(true);
		const latitude = interaction.options.getNumber('latitude', false);
		const longitude = interaction.options.getNumber('longitude', false);
		// Default to 10km if not provided
		const distance = interaction.options.getInteger('distance', false) ?? 10;
		const unit = interaction.options.getString('unit', false) ?? 'km';
		const radius = unit === 'km' ? distance : distance / 1000;
		const city = interaction.options.getString('city');

		let center: { lat: number; long: number } | null = null;
		if (latitude !== null && longitude !== null) center = { lat: latitude, long: longitude };

		return {
			subcommand,
			latitude,
			longitude,
			center,
			distance,
			unit,
			radius,
			city,
		};
	}
}
