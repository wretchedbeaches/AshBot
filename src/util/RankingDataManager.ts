import Collection from '@discordjs/collection';
import axios from 'axios';
import cheerio from 'cheerio';
import { RankingDataType } from '../models/Data';

export type RankingDataCollection = Collection<string, RankingDataType>;

interface LeagueDataMap {
	great: RankingDataCollection;
	ultra: RankingDataCollection;
	master: RankingDataCollection;
}

export default class RankingDataManager {
	public greatLeagueData: RankingDataCollection;
	public ultraLeagueData: RankingDataCollection;
	public masterLeagueData: RankingDataCollection;
	public leagueDataMap: LeagueDataMap | null;
	public version: string | null;

	public constructor() {
		this.greatLeagueData = new Collection();
		this.ultraLeagueData = new Collection();
		this.masterLeagueData = new Collection();
		this.version = null;
		this.leagueDataMap = null;
	}

	public async init() {
		const request = (await axios.get('https://pvpoke.com/rankings/')).data;
		const $ = await cheerio.load(request);
		this.version = $($('footer p.copyright a').toArray()[0]).text().trim();
		const replaceText = '[ranking]';
		const url = `https://pvpoke.com/data/rankings/all/overall/rankings-[ranking].json?v=${this.version}`;

		const greatLeagueData: RankingDataType[] = (await axios.get(url.replace(replaceText, '1500'))).data;
		const ultraLeagueData: RankingDataType[] = (await axios.get(url.replace(replaceText, '2500'))).data;
		const masterLeagueData: RankingDataType[] = (await axios.get(url.replace(replaceText, '10000'))).data;

		this.initCollection(this.greatLeagueData, greatLeagueData);
		this.initCollection(this.ultraLeagueData, ultraLeagueData);
		this.initCollection(this.masterLeagueData, masterLeagueData);
		this.leagueDataMap = {
			great: this.greatLeagueData,
			ultra: this.ultraLeagueData,
			master: this.masterLeagueData,
		};
	}

	private initCollection(collection: RankingDataCollection, rankingData: RankingDataType[]) {
		rankingData.forEach((rank) => collection.set(rank.speciesName.toLowerCase(), rank));
	}
}
