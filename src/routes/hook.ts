import { Router } from 'express';
import client from '../Bot';
import { parsePokemon, parseRaid, parseQuest, parseInvasion } from '../util/parse';
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
	filterTeam,
	filterTrain,
	isInvalid,
	isValid,
} from './filters';
import { InvasionEventData, PokemonEventData, QuestEventData, RaidEventData } from '../models/WebhookData';
import { pokemonData, pokemonTypesData, questRewardTypesData, weatherData } from '../data/Data';
import { PokemonData, TypeElement } from '../data/DataTypes';

const handlePokemon = (
	client: BotClient,
	pokemon: PokemonData,
	event: PokemonEventData,
	{ channelConfig, channelId, guildId },
) => {
	const { cp, pokemon_level, individual_attack, individual_defense, individual_stamina, latitude, longitude, weather } =
		event;

	const weatherInfo = weather === null || weather === undefined ? null : weatherData[weather];
	const isBoosted =
		isValid(weatherInfo) &&
		pokemon.types.some((type) => weatherInfo!.boosted.includes(pokemonTypesData[type]?.name as TypeElement));
	let iv: number | undefined = undefined;
	if (individual_attack && individual_defense && individual_stamina)
		iv = ((individual_attack + individual_defense + individual_stamina) / 45) * 100;

	if (
		filterBoosted(channelConfig, isBoosted) &&
		filterCP(channelConfig, cp) &&
		filterLevel(channelConfig, pokemon_level) &&
		filterIV(channelConfig, iv) &&
		filterRawIV(channelConfig, { individual_attack, individual_defense, individual_stamina }) &&
		filterName(channelConfig, pokemon.name) &&
		(filterLongLat(latitude, longitude) ||
			(filterGeo(channelConfig, { latitude, longitude }) &&
				filterTrain(client, channelId, channelConfig, { latitude, longitude })))
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
		const pokemonEmbed = parsePokemon(event, guildId as string, true, distanceFromPrevious);
		if (!client.embedQueue.has(channelId)) client.embedQueue.set(channelId, []);
		client.embedQueue.get(channelId)!.push(pokemonEmbed);
		return true;
	}
	return false;
};

const handleRaid = (client: BotClient, event: RaidEventData, { channelConfig, channelId, guildId }) => {
	const { cp, pokemon_id, latitude, longitude, team_id, level, ex_raid_eligible } = event;
	const pokemon = pokemonData[pokemon_id ?? ''];
	if (isInvalid(pokemon)) {
		return false;
	}
	if (
		filterExRaid(channelConfig, ex_raid_eligible) &&
		filterTeam(channelConfig, team_id) &&
		filterCP(channelConfig, cp) &&
		filterLevel(channelConfig, level) &&
		filterName(channelConfig, pokemon!.name) &&
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
		return true;
	}
	return false;
};

const handleQuest = async (client: BotClient, event: QuestEventData, { channelConfig, channelId, guildId }) => {
	const { pokestop_id, latitude, longitude, rewards } = event;
	const dbPokestop = await pokestop.findByPk(pokestop_id);
	const reward = rewards![0];
	const rewardData = questRewardTypesData[reward.type];
	if (
		channelConfig.rewardType !== undefined ||
		(rewardData &&
			rewardData.text.toLowerCase() === channelConfig.rewardType &&
			(filterLongLat(latitude, longitude) || filterGeo(channelConfig, { latitude, longitude })))
	) {
		const questEmbed = parseQuest(event, guildId, true, dbPokestop?.incident_expire_timestamp);
		if (!client.embedQueue.has(channelId)) client.embedQueue.set(channelId, []);
		client.embedQueue.get(channelId)!.push(questEmbed);
		return true;
	}
	return false;
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
		if (!client.embedQueue.has(channelId) || client.embedQueue.get(channelId) === undefined)
			client.embedQueue.set(channelId, []);
		client.embedQueue.get(channelId)!.push(invasionEmbed);
		return true;
	}
	return false;
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
					if (channelConfig.type !== event.type || event.message.pokemon_id === 0) {
						continue;
					}
					let handled = false;
					let pokemon: PokemonData | undefined;
					try {
						switch (event.type) {
							case 'pokemon':
								if (event.message.capture_1 === 0) continue;
								pokemon = pokemonData[event.message.pokemon_id];
								if (isInvalid(pokemonData)) continue;
								handled = handlePokemon(client, pokemon!, event.message as PokemonEventData, {
									channelConfig,
									channelId,
									guildId,
								});
								break;
							case 'raid':
								handled = handleRaid(client, event.message as RaidEventData, { channelConfig, channelId, guildId });
								break;
							case 'quest':
								// TO DO: THis may not be great and may be fine to handle async
								handled = await handleQuest(client, event.message as QuestEventData, {
									channelConfig,
									channelId,
									guildId,
								});
								break;
							case 'invasion':
								handled = handleInvasion(client, event.message as InvasionEventData, {
									channelConfig,
									channelId,
									guildId,
								});
								break;
							default:
								handled = true;
								client.logger.error(
									`Unknown event type '${(event.type as string | undefined) ?? 'undefined'} was encountered.`,
									{ eventMessage: event, config: channelConfig },
								);
								break;
						}
						if (!handled)
							client.logger.debug(`Webhook ignored by channel configuration filters.`, {
								evenetMessage: event,
								config: channelConfig,
							});
					} catch (error) {
						client.logger.error(error);
						client.logger.error(`Error encountered while trying to handle a Webhook Event.`, {
							evenetMessage: event,
							config: channelConfig,
							error: error,
						});
					}
				}
			}
		}
	}
	res.status(200).json({ message: 'SUCCESS' });
});

export default router;
