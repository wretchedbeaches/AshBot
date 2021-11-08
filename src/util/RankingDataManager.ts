import Collection from '@discordjs/collection';
import axios from 'axios';
import cheerio from 'cheerio';
import BotClient from '../client/BotClient';
import { GameMasterData, GameMasterPokemonData, RankingData } from '../data/PvPokeData';

export type RankingDataCollection = Collection<string, RankingData>;

interface LeagueDataMap {
	great: RankingDataCollection;
	ultra: RankingDataCollection;
	master: RankingDataCollection;
}

export default class RankingDataManager {
	public client: BotClient;
	public greatLeagueData: RankingDataCollection;
	public ultraLeagueData: RankingDataCollection;
	public masterLeagueData: RankingDataCollection;
	public leagueDataMap: LeagueDataMap | null;
	public version: string | null;

	public constructor(client: BotClient) {
		this.greatLeagueData = new Collection();
		this.ultraLeagueData = new Collection();
		this.masterLeagueData = new Collection();
		this.client = client;
		this.version = null;
		this.leagueDataMap = null;
	}

	public async init() {
		this.client.logger.info('Initilising runtime ranking data...');
		const request = (await axios.get('https://pvpoke.com/rankings/')).data;
		const $ = await cheerio.load(request as string);
		this.version = $($('footer p.copyright a').toArray()[0]).text().trim();
		this.client.logger.info(`Found version ${this.version} for ranking data...`);
		const replaceText = '[ranking]';
		const masterData = (await axios.get(`https://pvpoke.com/data/gamemaster.min.json?v=${this.version}`))
			.data as GameMasterData;
		const url = `https://pvpoke.com/data/rankings/all/overall/rankings-[ranking].json?v=${this.version}`;

		const greatLeagueData = (await axios.get(url.replace(replaceText, '1500'))).data as RankingData[];
		const ultraLeagueData = (await axios.get(url.replace(replaceText, '2500'))).data as RankingData[];
		const masterLeagueData = (await axios.get(url.replace(replaceText, '10000'))).data as RankingData[];

		this.initCollection(this.greatLeagueData, masterData.pokemon, greatLeagueData);
		this.initCollection(this.ultraLeagueData, masterData.pokemon, ultraLeagueData);
		this.initCollection(this.masterLeagueData, masterData.pokemon, masterLeagueData);
		this.leagueDataMap = {
			great: this.greatLeagueData,
			ultra: this.ultraLeagueData,
			master: this.masterLeagueData,
		};
		this.client.logger.info(`Ranking data successfully loaded...`);
	}

	private initCollection(
		collection: RankingDataCollection,
		masterPokemonData: GameMasterPokemonData[],
		rankingData: RankingData[],
	) {
		rankingData.forEach((rank) => {
			const matchingRank = masterPokemonData.find((val) => val.speciesId === rank.speciesId);
			rank.stats = matchingRank?.baseStats;
			collection.set(rank.speciesName.toLowerCase(), rank);
		});
	}
}
