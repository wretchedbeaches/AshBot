import { CommandInteraction, MessageEmbed } from 'discord.js';
import { movesData } from '../../data/Data';
import { RankingData } from '../../data/PvPokeData';
import COMMAND_NAMES from '../../util/CommandNames';
import { RankingDataCollection } from '../../util/RankingDataManager';
import BaseChannelRestrictedCommand from '../BaseChannelRestrictedCommand';

type LeagueIdentifier = 1500 | 2500 | 10000;
type LeagueName = 'great' | 'ultra' | 'master';

type LeagueMap = {
	[key in LeagueIdentifier]: LeagueName;
};
export default class RankSearchCommand extends BaseChannelRestrictedCommand {
	public static LeagueMap: LeagueMap = {
		1500: 'great',
		2500: 'ultra',
		10000: 'master',
	};

	public constructor() {
		super(COMMAND_NAMES.SEARCH.RANK, {
			description: {
				content: 'Search for PVP ranks by league and pokemon.',
				usage: 'rank `pokemon name` `league name`',
				examples: ['rank espeon ultra', 'rank great'],
			},
			category: 'Search',
			rateLimit: 3,
			cooldown: 3e5,
		});
	}

	public execute(interaction: CommandInteraction) {
		const nameArgument = interaction.options.getString('name', true);
		const leagueArgument: LeagueIdentifier | null =
			(interaction.options.getInteger('league', false) as LeagueIdentifier | null) ?? 1500;

		let data: RankingData | null = null;
		const embed = new MessageEmbed();
		const leagueName: LeagueName = RankSearchCommand.LeagueMap[leagueArgument];

		const rankingData: RankingDataCollection = this.client.rankingData.leagueDataMap![leagueName];
		if (rankingData.has(nameArgument.toLowerCase())) {
			data = rankingData.get(nameArgument.toLowerCase()) as RankingData;
			embed.setTitle(`${data.rating} ${data.speciesName}`);
			embed.setThumbnail(`https://play.pokemonshowdown.com/sprites/xyani/${data.speciesName.toLowerCase()}.gif`);
			embed.addField('Matchups', data.matchups.map((val) => `${val.opponent}: ${val.rating}`).join('\n'), false);
			embed.addField('Counters', data.counters.map((val) => `${val.opponent}: ${val.rating}`).join('\n'), false);
			embed.addField(
				'Fast Moves',
				data.moves.fastMoves
					.map((val) => {
						if (movesData[val.moveId]) return movesData[val.moveId]?.name ?? '';
						return val.moveId
							.toLowerCase()
							.split('_')
							.filter((x) => x.length > 1)
							.map((y) => y.charAt(0).toUpperCase() + y.slice(1))
							.join(' ');
					})
					.join('\n'),
				false,
			);
			embed.addField(
				'Charged Moves',
				data.moves.chargedMoves
					.map((val) => {
						if (movesData[val.moveId]) return movesData[val.moveId]?.name ?? '';
						return val.moveId
							.toLowerCase()
							.split('_')
							.filter((x) => x.length > 1)
							.map((y) => y.charAt(0).toUpperCase() + y.slice(1))
							.join(' ');
					})
					.join('\n'),
				false,
			);
			if (data.stats) {
				embed.addField(
					'Stats',
					`:crossed_swords: Attack: ${data.stats.atk}\n:shield: Defense: ${data.stats.def}\n:arrow_right: Stamina: ${data.stats.hp}`,
					false,
				);
			}
			return interaction.editReply({ embeds: [embed] });
		}
		return interaction.editReply(
			`Couldn't find a ranking for the Pokemon '${nameArgument}' in the '${leagueName}' league.`,
		);
	}
}
