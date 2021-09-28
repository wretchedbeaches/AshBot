import masterfile from '../util/masterfile.json';
import util from '../util/util.json';
import { Router } from 'express';
import client from '../Bot';
import { parsePokemon, parseRaid, parseQuest, parseInvasion, parseShinyPokemon } from '../util/parse';
import { getPreciseDistance } from 'geolib';
import { pokestop } from '../rdmdbModels/pokestop';
import BotClient from '../client/BotClient';
import {
	filterBoosted,
	filterCP,
	filterExRaid,
	filterGeo,
	filterIV,
	filterLeader,
	filterLevel,
	filterLongLat,
	filterName,
	filterRawIV,
	filterShiny,
	filterTeam,
	filterTrain,
	isInvalid,
	isValid,
} from './filters';

const boosted = {
	'partly cloudy': ['Normal', 'Rock'],
	cloudy: ['Fairy', 'Fighting', 'Poison'],
	fog: ['Dark', 'Ghost'],
	rain: ['Water', 'Electric', 'Bug'],
	snow: ['Ice', 'Steel'],
	sunny: ['Grass', 'Ground', 'Fire'],
	clear: ['Grass', 'Ground', 'Fire'],
	windy: ['Dragon', 'Flying', 'Psychic'],
};

export type EventType = 'pokemon' | 'raid' | 'quest' | 'invasion';

export interface PokemonRanking {
	pokemon: number;
	rank?: number;
	cp?: number;
	level?: number;
	percentage?: number;
}

export interface PokemonEventData {
	cp?: number | null;
	pokemon_level?: number | null;
	individual_attack?: number | null;
	individual_defense?: number | null;
	individual_stamina?: number | null;
	pokemon_id?: number | null;
	latitude?: number | null;
	longitude?: number | null;
	weather?: number | null;
	shiny?: boolean | null;
	username: string;
	capture_1?: number | null;
	capture_2?: number | null;
	capture_3?: number | null;
	move_1?: number | null;
	move_2?: number | null;
	pokestop_id?: string | null;
	spawnpoint_id: string | null;
	gender?: number | null;
	is_event?: boolean | null;
	disappear_time?: number | null;
	pvp_rankings_great_league?: PokemonRanking[] | null;
	pvp_rankings_ultra_league?: PokemonRanking[] | null;
	iv?: number | null;
	pokestop?: any | null;
}

export interface RaidEventData {
	gym_name?: string;
	latitude?: number;
	longitude?: number;
	gender?: number;
	gym_url?: string;
	level?: number;
	end: number;
	cp?: number;
	pokemon_id?: number;
	team_id?: number;
	move_1?: number;
	move_2?: number;
	ex_raid_eligible?: boolean;
}

export interface QuestEventRewardInfo {
	item_id?: number;
	amount?: number;
	pokemon_id?: number;
}
export interface QuestEventRewards {
	type: number;
	info: QuestEventRewardInfo;
}

export interface PokemonConditionInfo {
	pokemon_ids?: number[];
	pokemon_type_ids?: number[];
	hit?: boolean;
	throw_type_id?: number;
	raid_levels?: any;
}

export interface PokemonCondition {
	type?: number;
	info: PokemonConditionInfo;
}

export interface QuestEventData {
	pokestop_id?: string;
	latitude?: number;
	longitude?: number;
	type?: number;
	target?: number;
	gender?: number;
	pokestop_name?: string;
	rewards?: QuestEventRewards[];
	updated?: number;
	template?: string;
	ar_scan_eligible?: boolean;
	conditions: PokemonCondition[];
}

export interface InvasionEventData {
	latitude?: number;
	longitude?: number;
	grunt_type: number;
	name?: string;
	url?: string;
	incident_expire_timestamp?: number;
}

export interface HookEvent {
	type: EventType;
	message: PokemonEventData | RaidEventData | QuestEventData;
}

const handlePokemon = (client: BotClient, event: PokemonEventData, { channelConfig, channelId, guildId }) => {
	let pokemonEmbed;
	const {
		cp,
		pokemon_level,
		individual_attack,
		individual_defense,
		individual_stamina,
		pokemon_id,
		latitude,
		longitude,
		weather,
		shiny,
		username,
		capture_1,
	} = event;

	if (pokemon_id === undefined) return;

	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	const pokemonData = masterfile.pokemon[`${pokemon_id}`];
	if (isInvalid(pokemonData) || capture_1 === 0 || cp === undefined) {
		return;
	}

	const isBoosted =
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		weather !== 0 && pokemonData.types.some((type) => boosted[util.weather[`${weather}`].name].includes(type));
	let iv: number | undefined = undefined;
	if (individual_attack && individual_defense && individual_stamina)
		iv = ((individual_attack + individual_defense + individual_stamina) / 45) * 100;

	if (
		filterBoosted(channelConfig, isBoosted) &&
		filterCP(channelConfig, cp) &&
		filterLevel(channelConfig, pokemon_level) &&
		filterIV(channelConfig, iv) &&
		filterRawIV(channelConfig, { individual_attack, individual_defense, individual_stamina }) &&
		filterName(channelConfig, pokemonData.name) &&
		(filterLongLat(latitude, longitude) ||
			(filterGeo(channelConfig, { latitude, longitude }) &&
				filterTrain(client, channelId, channelConfig, { latitude, longitude }))) &&
		filterShiny(channelConfig, username, shiny)
	) {
		let distanceFromPrevious;
		if (client.trains.has(channelId) && channelConfig.train) {
			const train = client.trains.get(channelId)!;
			distanceFromPrevious = getPreciseDistance(
				{ latitude: latitude!, longitude: longitude! },
				{
					latitude: train.latitude,
					longitude: train.longitude,
				},
			);
		}
		client.trains.set(channelId, {
			latitude: latitude!,
			longitude: longitude!,
		});
		if (!pokemonEmbed)
			pokemonEmbed = shiny
				? parseShinyPokemon(event, guildId as string)
				: parsePokemon(event, guildId as string, true, distanceFromPrevious);
		if (!client.embedQueue.has(channelId)) client.embedQueue.set(channelId, []);
		client.embedQueue.get(channelId)!.push(pokemonEmbed);
	}
};

const handleRaid = (client: BotClient, event: RaidEventData, { channelConfig, channelId, guildId }) => {
	const { cp, pokemon_id, latitude, longitude, team_id, level, ex_raid_eligible } = event;
	const pokemonData = masterfile.pokemon[`${pokemon_id ?? ''}`];
	if (isInvalid(pokemonData)) {
		return;
	}
	if (
		filterExRaid(channelConfig, ex_raid_eligible) &&
		filterTeam(channelConfig, team_id) &&
		filterCP(channelConfig, cp) &&
		filterLevel(channelConfig, level) &&
		filterName(channelConfig, pokemonData.name) &&
		(filterLongLat(latitude, longitude) ||
			(filterGeo(channelConfig, { latitude, longitude }) &&
				filterTrain(client, channelId, channelConfig, { latitude, longitude })))
	) {
		let distanceFromPrevious;
		if (client.trains[channelId] && channelConfig.train)
			distanceFromPrevious = getPreciseDistance(
				{ latitude: latitude!, longitude: longitude! },
				{
					latitude: client.trains[channelId].latitude,
					longitude: client.trains[channelId].longitude,
				},
			);
		client.trains[channelId] = {
			latitude: latitude,
			longitude: longitude,
		};
		const raidEmbed = parseRaid(event, guildId as string, true, distanceFromPrevious);
		if (!client.embedQueue.has(channelId)) client.embedQueue.set(channelId, []);
		client.embedQueue.get(channelId)!.push(raidEmbed);
	}
};

const handleQuest = async (
	client: BotClient,
	event: QuestEventData,
	{ channelConfig, channelId, guildId },
): Promise<void> => {
	const { pokestop_id, latitude, longitude, rewards } = event;
	const dbPokestop = await pokestop.findByPk(pokestop_id);
	if (
		channelConfig.rewardType !== undefined ||
		(masterfile.quest_reward_types[rewards![0].type] &&
			masterfile.quest_reward_types[rewards![0].type].text.toLowerCase() === channelConfig.rewardType &&
			(filterLongLat(latitude, longitude) || filterGeo(channelConfig, { latitude, longitude })))
	) {
		const questEmbed = parseQuest(event, guildId, true, dbPokestop?.incident_expire_timestamp);
		if (!client.embedQueue.has(channelId)) client.embedQueue.set(channelId, []);
		client.embedQueue.get(channelId)!.push(questEmbed);
	}
};

const handleInvasion = (client: BotClient, event: InvasionEventData, { channelConfig, channelId, guildId }) => {
	const { latitude, longitude, grunt_type } = event;
	if (
		filterLeader(channelConfig, grunt_type) &&
		(filterLongLat(latitude, longitude) ||
			(filterGeo(channelConfig, { latitude, longitude }) &&
				filterTrain(client, channelId, channelConfig, { latitude, longitude })))
	) {
		const invasionEmbed = parseInvasion(event, guildId, true);
		if (!client.embedQueue.has(channelId)) client.embedQueue.set(channelId, []);
		client.embedQueue[channelId].push(invasionEmbed);
	}
};

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('', async (req, res) => {
	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	client.logger.info(`[Bot] Recieved ${req.body.length} Events`);
	for (const event of req.body) {
		for (const [guildId, { channels }] of client.settings.items) {
			for (const channelId in channels) {
				if (Object.prototype.hasOwnProperty.call(channels, channelId)) {
					const channelConfig = channels[channelId];
					if (isValid(channelConfig.type) && channelConfig.type !== event.type) {
						continue;
					}
					switch (event.type) {
						case 'pokemon':
							handlePokemon(client, event.message as PokemonEventData, {
								channelConfig,
								channelId,
								guildId,
							});
							break;
						case 'raid':
							handleRaid(client, event.message as RaidEventData, { channelConfig, channelId, guildId });
							break;
						case 'quest':
							// TO DO: THis may not be great and may be fine to handle async
							await handleQuest(client, event.message as QuestEventData, { channelConfig, channelId, guildId });
							break;
						case 'invasions':
							handleInvasion(client, event.message as InvasionEventData, { channelConfig, channelId, guildId });
							break;
						default:
							client.logger.error(
								`Unknown event type '${(event.type as string | undefined) ?? 'undefined'} was encountered.`,
								{ eventMessage: event },
							);
							break;
					}
				}
			}
		}
	}
	return res.status(200).json({ message: 'SUCCESS' });
});

export default router;
