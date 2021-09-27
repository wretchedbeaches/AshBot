import masterfile from '../util/masterfile.json';
import util from '../util/util.json';
import config from '../config.json';
import { Router } from 'express';
const inside = require('point-in-polygon');
import client from '../Bot';
import { parsePokemon, parseRaid, parseQuest, parseInvasion, parseShinyPokemon } from '../util/parse';
import { getPreciseDistance } from 'geolib';
import { pokestop } from '../rdmdbModels/pokestop';
import https from 'https';
import BotClient from '../client/BotClient';
import {
	filterBoosted,
	filterCP,
	filterExRaid,
	filterGeo,
	filterIV,
	filterLevel,
	filterLongLat,
	filterName,
	filterRawIV,
	filterShiny,
	filterTeam,
	filterTrain,
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

/*
{
  "type": "pokemon",
  "message": {
    "move_2": 279,
    "capture_2": 0.9408173561096191,
    "capture_1": 0.8481332063674927,
    "pokemon_id": 633,
    "disappear_time": 1602939017,
    "weather": 0,
    "move_1": 221,
    "username": "fuckyoulol",
    "individual_stamina": 15,
    "encounter_id": "9683730851273318429",
    "cp": 910,
    "gender": 1,
    "individual_defense": 15,
    "last_modified_time": 1602938017,
    "weight": 21.956737518310547,
    "form": 0,
    "spawnpoint_id": "8831929575585",
    "pokestop_id": "b972f89a8bea46b694adcc449554e980.16",
    "individual_attack": 15,
    "pokemon_level": 30,
    "shiny": false,
    "display_pokemon_id": null,
    "capture_3": 0.9769364595413208,
    "disappear_time_verified": false,
    "latitude": 37.795556,
    "first_seen": 1602933917,
    "longitude": -122.393434,
    "height": 0.8579838228225708,
    "is_event": false,
    "costume": 0
  }
}
*/

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
	gender?: any;
	gym_url?: string;
	level?: number;
	end?: any;
	cp?: number;
	pokemon_id?: number;
	team_id?: number;
	move_1?: number;
	move_2?: number;
	ex_raid_eligible?: boolean;
}

export interface QuestEventData {
	pokestop_id?: string;
	latitude?: number;
	longitude?: number;
	type?: any;
	pokestop_name?: string;
	rewards?: any;
}

export interface InvasionEventData {
	latitude?: number;
	longitude?: number;
	grunt_type?: any;
	name?: string;
	url?: string;
	incident_expire_timestamp?: number;
}

export interface HookEvent {
	type: EventType;
	message: PokemonEventData | RaidEventData | QuestEventData;
}

const handlePokemon = (client: BotClient, event: PokemonEventData) => {
	let pokemonEmbed;
	for (const [guildId, { channels }] of client.settings.items) {
		for (const channelId in channels) {
			if (Object.prototype.hasOwnProperty.call(channels, channelId)) {
				const channelConfig = channels[channelId];
				if (channelConfig.type !== 'pokemon') continue;
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

				if (pokemon_id === undefined) break;

				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				const pokemonData = masterfile.pokemon[`${pokemon_id}`];
				if (!pokemonData || capture_1 === 0 || cp === undefined) {
					break;
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
			}
		}
	}
};

const handleRaid = (client: BotClient, event: RaidEventData) => {
	for (const [guildId, { channels }] of client.settings.items) {
		for (const channelId in channels) {
			if (Object.prototype.hasOwnProperty.call(channels, channelId)) {
				const channelConfig = channels[channelId];
				if (channelConfig.type !== 'raid') continue;
				const { cp, pokemon_id, latitude, longitude, team_id, level, ex_raid_eligible } = event;
				const pokemonData = masterfile.pokemon[`${pokemon_id ?? ''}`];
				if (!pokemonData) {
					break;
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
			}
		}
	}
};

const handleQuest = async (client, event: QuestEventData): Promise<void> => {
	const { pokestop_id, latitude, longitude, rewards } = event;
	const dbPokestop = await pokestop.findByPk(pokestop_id);
	for (const [guildId, { channels }] of client.settings.items) {
		for (const channelId in channels) {
			if (Object.prototype.hasOwnProperty.call(channels, channelId)) {
				const channelConfig = channels[channelId];
				if (
					channelConfig.rewardType !== undefined ||
					(masterfile.quest_reward_types[rewards[0].type] &&
						masterfile.quest_reward_types[rewards[0].type].text.toLowerCase() === channelConfig.rewardType &&
						(filterLongLat(latitude, longitude) || filterGeo(channelConfig, { latitude, longitude })))
				) {
					const questEmbed = parseQuest(event, guildId, true, dbPokestop?.incident_expire_timestamp);
					client.embedQueue.get(channelId).push(questEmbed);
				}
			}
		}
	}
};

const handleInvasion = (client, event) => {
	console.log(client, event);
};

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('', async (req, res) => {
	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	client.logger.info(`[Bot] Recieved ${req.body.length} Events`);
	for (const event of req.body) {
		switch (event.type) {
			case 'pokemon':
				handlePokemon(client, event.message as PokemonEventData);
				break;
			case 'raid':
				handleRaid(client, event.message as RaidEventData);
				break;
			case 'quest':
				// TO DO: THis may not be great and may be fine to handle async
				await handleQuest(client, event.message as QuestEventData);
				break;
			case 'invasions':
				handleInvasion(client, event.message as InvasionEventData);
				break;
		}
	}
	return res;
});
