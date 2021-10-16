import { CommandInteraction } from 'discord.js';
import sequelize, { Op } from 'sequelize';
import ntim from '../../util/name_to_id_map.json';
import config from '../../config.json';
import { stripIndents } from 'common-tags';
import { gym } from '../../rdmdbModels/gym';
import { parseRaidDb } from '../../util/parse';
import BaseSearchCommand from './BaseSearchCommand';
import { Literal, Where } from 'sequelize/types/lib/utils';
import teams from '../../data/teams.json';
import { ButtonPaginator } from '@psibean/discord.js-pagination';

export default class RaidSearchCommand extends BaseSearchCommand {
	public constructor() {
		super('raidsearch', {
			description: {
				content: 'Search for raids.',
				usage: stripIndents`raidsearch
        \`pokemon's name\`
        \`distance(km/m) lattitude,longitude\`
        \`city\`
        ex \`true|false\`
        \`team\`
        level \`raid level\``,
				examples: ['raidsearch name pikachu geofilter 10km 85.4,-92.8 ex true team valor level 5'],
			},
		});

		this.data.addStringOption((pokemonNameOption) =>
			pokemonNameOption.setName('name').setDescription('The name of the pokemon to search by').setRequired(true),
		);
		RaidSearchCommand.addCommonOptions(this.data);
		this.data
			.addBooleanOption((exOption) => exOption.setName('ex').setDescription('Whether to search for ex raids'))
			.addStringOption((teamOption) =>
				teamOption
					.setName('team')
					.setDescription('Search for raids on the specified team')
					.addChoices([
						['uncontested', 'uncontested'],
						['mystic', 'mystic'],
						['valor', 'valor'],
						['instinct', 'instinct'],
						['any', 'any'],
					]),
			)
			.addIntegerOption((levelOption) =>
				levelOption.setName('option').setDescription('Search for raids of a particular level'),
			);
	}

	public async execute(interaction: CommandInteraction) {
		const nameArgument = interaction.options.getString('name', true);
		const pokemonId = ntim[nameArgument.toLowerCase()];
		if (!pokemonId)
			return interaction.editReply(`THe provided pokemon name '${nameArgument}' could not be resolved to a pokemon.`);
		const { center, radius, unit, city } = this.parseCommonArgs(interaction);
		if (city !== null)
			if (config.cities[city] === undefined)
				return interaction.editReply(`The provided city '${city}' does not seem to be valid.`);

		const ex = interaction.options.getBoolean('ex', false);
		const team = interaction.options.getString('team', false) ?? 'any';
		const level = interaction.options.getInteger('level', false);

		const distanceQuery = RaidSearchCommand.getDistanceQuery('gym', center);
		const withinCityQuery = RaidSearchCommand.getWithinCityQuery('gym', city);
		const dbRaidsAnd: (Where | Literal | Record<string, unknown>)[] = [];
		if (center !== null && distanceQuery !== null)
			dbRaidsAnd.push(
				sequelize.where(distanceQuery, {
					[Op.lte]: radius,
				}),
			);

		if (withinCityQuery !== null) {
			dbRaidsAnd.push(withinCityQuery);
		} else if (center !== null && distanceQuery !== null)
			dbRaidsAnd.push(
				sequelize.where(distanceQuery, {
					[Op.lte]: radius,
				}),
			);

		const additionalFilters: Record<string, unknown> = {};
		if (pokemonId === null) additionalFilters['raid_pokemon_id'] = { [Op.ne]: 0 };
		else additionalFilters['raid_pokemon_id'] = pokemonId;
		if (level !== null) additionalFilters['raid_level'] = { [Op.eq]: level };
		if (ex !== null) additionalFilters['ex_raid_eligible'] = ex ? 1 : 0;
		// TODO: Or is the any option actually in the db...?
		if (team !== 'any') {
			additionalFilters['team_id'] = teams[team].id;
		}
		dbRaidsAnd.push(additionalFilters);

		const dbRaids = await gym.findAll({
			...(center !== null && distanceQuery !== null && { order: distanceQuery }),
			where: {
				[Op.and]: dbRaidsAnd,
			},
			limit: parseInt(process.env.SEARCH_LIMIT!, 10),
		});
		let confirmation = `Found ${dbRaids.length}`;
		if (ex !== null) confirmation += ex ? ' EX' : ' Regular';
		confirmation += ' raids';
		if (center) confirmation += ` within ${unit === 'km' ? `${radius}km` : `${radius * 1000}m`}`;
		else if (withinCityQuery !== null) confirmation += ` in ${city!}}`;
		if (level !== null) confirmation += ` and with level ${level}`;
		if (team !== 'any') confirmation += ` and with team ${team}`;

		await interaction.channel!.send(confirmation);
		if (dbRaids.length > 0) {
			// creating and sending paginated embed with results
			const embeds = dbRaids.map((raid) => parseRaidDb(raid, interaction.guildId!));
			const messageOptionsResolver = ({ newIdentifiers, paginator }) => {
				return {
					content: `Page ${(newIdentifiers.pageIdentifier as number) + 1} of ${
						paginator.maxNumberOfPages as number
					} | ${this.client
						.getEmoji(`pokemon_${dbRaids[newIdentifiers.pageIdentifier]!.raid_pokemon_id as number}`)
						.toString()} ${dbRaids[newIdentifiers.pageIdentifier].lat.toFixed(5)},${dbRaids[
						newIdentifiers.pageIdentifier
					].lon.toFixed(5)}`,
				};
			};
			const buttonPaginator = new ButtonPaginator(embeds, { maxNumberOfPages: embeds.length, messageOptionsResolver });
			return buttonPaginator.send();
		}
	}
}
