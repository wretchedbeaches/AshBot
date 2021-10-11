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
import { InvasionEventData, PokemonEventData, QuestEventData, RaidEventData } from '../models/WebhookData';

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

	const pokemonData = masterfile.pokemon[`${pokemon_id ?? ''}`];
	if (isInvalid(pokemonData) || capture_1 === 0 || cp === undefined) {
		return;
	}

	const isBoosted =
		isValid(weather) &&
		weather !== 0 &&
		pokemonData.types &&
		pokemonData.types.some((type) => boosted[util.weather[`${weather!}`].name].includes(type));
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
	client.logger.info(`[Bot] Recieved ${(req.body?.length as number | undefined) ?? 'unknown'} Events`);
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
						case 'invasion':
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
	res.status(200).json({ message: 'SUCCESS' });
});

export default router;
