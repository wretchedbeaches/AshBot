import { CommandInteraction } from 'discord.js';
import { getPreciseDistance } from 'geolib';
import config from '../../config.json';
import Command from '../../struct/commands/Command';

export default class DistanceCommand extends Command {
	public constructor() {
		super('distance', {
			description: {
				content: 'Check the distance and associated softban cooldown time between two points.',
				usage: 'distance `latitude` `longitude` `latitude` `longitude`',
				examples: ['distance 41.63576 -0.90853 41.60914 -0.89437'],
			},
			category: 'Utilities',
			rateLimit: 3,
			isEphemeral: true,
		});
	}

	public async execute(interaction: CommandInteraction) {
		const fromLatitude = interaction.options.getNumber('from_latitude', true);
		const fromLongitude = interaction.options.getNumber('fromLongitude', true);
		const toLatitude = interaction.options.getNumber('to_latitude', true);
		const toLongitude = interaction.options.getNumber('to_longitude', true);

		if (
			this.isInvalid(fromLatitude, 90) ||
			this.isInvalid(fromLongitude, 180) ||
			this.isInvalid(toLatitude, 90) ||
			this.isInvalid(toLongitude, 180)
		) {
			return interaction.editReply(
				`Invalid lat/long values provided. Ensure latitude is between -90 and 90 and longitude is between -180 and 180.\n\nfrom lat/long: ${fromLatitude}/${fromLongitude}\n To lat/long: ${toLatitude}/${toLongitude}`,
			);
		}

		const distance = getPreciseDistance(
			{ latitude: fromLatitude, longitude: fromLongitude },
			{ latitude: toLatitude, longitude: toLongitude },
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
			cooldownTime = config.softbanCooldown[config.softbanCooldown.length - 1][1];
		const embed = this.client.embed(interaction.guildId).addFields({
			name: '__Calculated Distance__',
			value: `${distance > 1000 ? distance / 1000 : distance} ${distance > 1000 ? 'km' : 'm'}`,
		});
		if (cooldownTime > 0)
			embed.addFields({
				name: '__Cooldown Timer__',
				value: `${cooldownTime} minutes`,
			});
		return interaction.editReply({ embeds: [embed] });
	}

	private isInvalid(val: number, range: number) {
		return val < -range || val > range;
	}
}
