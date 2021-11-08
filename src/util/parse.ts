// TODO: Add support for evolution cost [candy cost/stardust cost] / custom embed structure / add support for invasion encounters
// TODO: Add support for tile-server to display tileserver-GL on embeds, templates (whmgr/poraclejs) / make optional
// TODO: Restucture embeds for quests, invasions, pokemon, raids, nests. (better data display for user ease)
// TODO: Fix type weakness/immunity on pokemon/raid embeds / Make weakness, catch %, rank optional
import moment, { Moment } from 'moment';
import geoTz from 'geo-tz';
import 'moment-timezone';
import 'moment-precise-range-plugin';
import config from '../config.json';
import client from '../Bot';
import { GuildEmoji, MessageEmbed } from 'discord.js';
import countryFlagEmoji from 'country-flag-emoji';
import nearbyCities from 'nearby-cities';
import { stripIndents } from 'common-tags';
import proto from './en.json';
import {
	pokemonData,
	movesData,
	pokemonTypesData,
	questTypesData,
	weatherData,
	teamsData,
	gruntTypesData,
} from '../data/Data';
import {
	InvasionEventData,
	PokemonEventData,
	QuestEventData,
	QuestEventRewards,
	RaidEventData,
} from '../models/WebhookData';
import { isNonEmptyArray, isValid } from '../routes/filters';
import { nests } from '../manualdbModels/nests';
import { pokestop } from '../rdmdbModels/pokestop';
import { weather } from '../rdmdbModels/weather';
import { gym } from '../rdmdbModels/gym';
import { PokemonData, Weather } from '../data/DataTypes';
import { pokemon as PokemonModel } from '../rdmdbModels/pokemon';

export interface LocationEmoji {
	name: string;
	emoji: string;
}

// function to get custom discord emoji string from its name
const emoji = (name: string | undefined) => {
	try {
		const foundEmoji: GuildEmoji | undefined = client.emojis.cache.find((emoji) => emoji.name === name);
		if (foundEmoji === undefined) return name;
		return foundEmoji.toString();
	} catch (e) {
		return name;
	}
};

const parseGender = (gender?: number | null): string => {
	if (isValid(gender)) {
		const genderEmojiName: string | undefined = config.genderEmojis[`${gender!}`];
		let genderEmoji = emoji(genderEmojiName);
		if (genderEmojiName === undefined || genderEmoji === `${gender!}`) {
			switch (gender!) {
				case 1:
					genderEmoji = ':male_sign';
					break;
				case 2:
					genderEmoji = ':female_sign:';
					break;
				case 3:
					genderEmoji = 'genderless ⚧';
					break;
			}
		}
		return genderEmoji ?? '';
	}
	return '';
};

const parseLocation = (locationEmoji: LocationEmoji | undefined, city: { name: string | undefined }) => {
	if (isValid(locationEmoji)) {
		return `**${locationEmoji!.emoji} ${city.name ?? 'unknown'}, ${locationEmoji!.name}**\n`;
	}
	return '';
};

const parseAppleGoogle = (latitude: number, longitude: number) => {
	return `/n ${emoji(
		config.statsEmojis.google,
	)!} [[**Google**]](https://www.google.com/maps?q=${latitude},${longitude}) ${emoji(
		config.statsEmojis.apple,
	)!} [[**Apple**]](http://maps.apple.com/maps?daddr=${latitude},${longitude}&z=10&t=s&dirflg=d)`;
};

export function parsePokemon(
	pokemonEvent: PokemonEventData,
	guildId: string,
	webhook: boolean,
	distanceFromPrevious?: number,
): {
	embed: MessageEmbed;
	message: string;
} {
	let {
		pokemon_id,
		cp,
		capture_1,
		capture_2,
		capture_3,
		pokemon_level,
		move_1,
		move_2,
		gender,
		latitude,
		longitude,
		individual_attack,
		individual_defense,
		individual_stamina,
		disappear_time,
		pvp_rankings_great_league,
		pvp_rankings_ultra_league,
		weather,
		iv,
		pokestop,
	} = pokemonEvent;
	const pokemon: PokemonData = pokemonData[pokemon_id!]!;
	// calculating time when pokemon expires and remaining time until pokemon expires
	const disappearTime = moment.utc(disappear_time! * 1000).tz(geoTz(latitude, longitude).toString());
	const now = moment.utc(moment.now()).tz(geoTz(latitude, longitude).toString());
	const duration = moment.preciseDiff(disappearTime, now);

	// looking up city, country and emoji location data
	const city = nearbyCities({
		latitude: latitude,
		longitude: longitude,
	})[0];
	const locationEmoji: LocationEmoji | undefined = countryFlagEmoji.get(city.country);

	// calculating iv
	if (!iv)
		if (individual_attack !== null && individual_defense !== null && individual_stamina !== null)
			iv = ((individual_attack! + individual_defense! + individual_stamina!) / 45) * 100;

	const embed = client.embed(guildId);

	if (!webhook) embed.setTitle(`${pokemon.name} ${latitude!.toFixed(5)},${longitude!.toFixed(5)}`);
	embed.setColor(pokemonTypesData[pokemon.types[0]]!.color);
	embed.setThumbnail(
		`https://play.pokemonshowdown.com/sprites/xyani/${pokemon.name.toLowerCase().split(' ').join('')}.gif`,
	);

	// line 1: name and gender
	let description = `**${pokemon.name}**`;
	description = `${description} ${parseGender(gender)}`.trim();

	// line 2, 3: cp, iv and 1v1
	if (isValid(cp) && isValid(iv) && isValid(pokemon_level)) {
		description += `\n${emoji(config.statsEmojis.cp)!} **${cp!}**\n${emoji(
			emoji(config.statsEmojis.iv),
		)!} **${iv!.toFixed(1)}%**`;
		if (isValid(individual_attack) && isValid(individual_defense) && isValid(individual_stamina)) {
			description += ` **(${individual_attack!}/${individual_defense!}/${individual_stamina!})**\n`;
		}
		description += `${emoji(config.statsEmojis.level)!} **${pokemon_level ?? ''}**\n`;
	}

	// line 4: moveset
	if (isValid(move_1) && isValid(move_2)) {
		description += `${emoji(config.statsEmojis.moveset)!} ${movesData[move_1!]?.name ?? ''}/${
			movesData[move_2!]?.name ?? ''
		}\n`;
	}

	// line 5: despawn time and time remaining
	description += `${emoji(config.statsEmojis.despawn)!}: ${duration}\n`;
	const pokemonDataIsValid = isValid(pokemon);
	// line 6: types and weather
	if (pokemonDataIsValid) {
		description += `**Types:** ${pokemon.types
			.map((type: string | number) => {
				const typeData = pokemonTypesData[type]!;
				const typeEmoji = emoji(typeData.emoji);
				return typeEmoji === typeData.name ? typeData.emojiBackup : typeEmoji;
			})
			.join(' ')} `;
	}

	if (weather !== 0 && isValid(weather)) {
		const weatherInfo: Weather | undefined = weatherData[weather!];
		if (weatherInfo) {
			description += `| **Weather:** `;
			const weatherEmoji = emoji(weatherInfo.emoji);
			if (weatherEmoji && weatherEmoji !== weatherInfo.emoji) {
				description += weatherEmoji === weatherInfo.emoji ? weatherInfo.emojiBackup : weatherEmoji;
			} else {
				description += weatherInfo.emojiBackup;
			}
			if (pokemon.types.some((type) => weatherInfo.boosted.includes(type))) {
				description += `**BOOSTED**`;
			}
		}
	}

	// line 7: capture %s
	if (isValid(capture_1) && isValid(capture_2) && isValid(capture_3)) {
		description += `${emoji(config.captureEmojis['1'])!} ${(capture_1! * 100).toFixed(2)}% ${emoji(
			config.captureEmojis['2'],
		)!} ${(capture_2! * 100).toFixed(2)}% ${emoji(config.captureEmojis['3'])!} ${(capture_3! * 100).toFixed(2)}%\n`;
	}

	// line 8: pokestop
	if (isValid(pokestop)) {
		description += `**Near Pokestop:** [${pokestop.dataValues?.name ? (pokestop.dataValues.name as string) : ''}](${
			pokestop.dataValues.url as string
		}) [**[Coords](https://www.google.com/maps?q=${pokestop.dataValues.lat as string},${
			pokestop.dataValues.lon as string
		})**]\n`;
	}

	// location emoji + city & name
	description += parseLocation(locationEmoji, city);

	// remaining lines: pvp data
	const hasGreatLeagueRankings = isValid(pvp_rankings_great_league) && pvp_rankings_great_league!.length >= 0;
	const hasUltraLeagueRankings = isValid(pvp_rankings_ultra_league) && pvp_rankings_ultra_league!.length >= 0;
	if (hasGreatLeagueRankings || hasUltraLeagueRankings) {
		description += `**__PvP Rank Stats__**`;
		if (hasGreatLeagueRankings) {
			// great league pvp data
			description += `\n${emoji(config.leagueEmojis.great)!}**Great League**:\n${pvp_rankings_great_league!
				.map((ranking, index) => {
					// TODO: This ranking.pokemon may already be a string.
					const p: PokemonData | undefined = pokemonData[ranking.pokemon];
					// TODO: Make this a function since it's repeated
					return (
						(ranking.rank ? `Rank #${ranking.rank}` : '') +
						(p?.name ?? '') +
						(ranking.cp ? ` ${ranking.cp}CP @L` : '') +
						(ranking.level ? `${ranking.level} ` : '') +
						(ranking.percentage ? `${(ranking.percentage * 100).toFixed(2)}%` : '') +
						(index === pvp_rankings_great_league!.length - 1 ? '' : '\n')
					);
				})
				.join('')}`;
		}

		if (hasUltraLeagueRankings) {
			// ultra league pvp data
			description += `\n${emoji(config.leagueEmojis.ultra)!}**Ultra League**:\n${pvp_rankings_ultra_league!
				.map((ranking, index) => {
					const p: PokemonData | undefined = pokemonData[ranking.pokemon];
					return (
						(ranking.rank ? `Rank #${ranking.rank}` : '') +
						(p?.name ?? '') +
						(ranking.cp ? ` ${ranking.cp}CP @L` : '') +
						(ranking.level ? `${ranking.level} ` : '') +
						(ranking.percentage ? `${(ranking.percentage * 100).toFixed(2)}%` : '') +
						(index === pvp_rankings_ultra_league!.length - 1 ? '' : '\n')
					);
				})
				.join('')}`;
		}
	}

	if (isValid(distanceFromPrevious)) {
		description += `\n**Distance From Previous**: ${distanceFromPrevious!}`;
	}

	description += parseAppleGoogle(latitude!, longitude!);

	embed.setDescription(description);
	return {
		embed: embed,
		message: `${emoji(`pokemon_${pokemon_id!}`)!} ${pokemon.name} | ${latitude?.toFixed(5) ?? 'unknown'},${
			longitude?.toFixed(5) ?? 'unknown'
		}`,
	};
}

export function parsePokemonDb(pokemon: PokemonModel, guildId: string, webhook: boolean): MessageEmbed {
	const eventPokemon: PokemonEventData = {
		pokemon_level: pokemon.level,
		latitude: pokemon.lat,
		longitude: pokemon.lon,
		individual_attack: pokemon.atk_iv,
		individual_defense: pokemon.def_iv,
		individual_stamina: pokemon.sta_iv,
		disappear_time: pokemon.expire_timestamp,
		pvp_rankings_great_league:
			pokemon.pvp_rankings_great_league === undefined ? null : JSON.parse(pokemon.pvp_rankings_great_league),
		pvp_rankings_ultra_league:
			pokemon.pvp_rankings_ultra_league === undefined ? null : JSON.parse(pokemon.pvp_rankings_great_league!),
		spawnpoint_id: null,
		username: 'data',
	};
	return parsePokemon(eventPokemon, guildId, webhook).embed;
}
export function parseNestDb(nest: nests) {
	const { lat, lon } = nest;
	const city = nearbyCities({ latitude: lat, longitude: lon })[0];
	const emoji = countryFlagEmoji.get(city.country);
	return stripIndents`${emoji.emoji} ${city.name}, ${emoji.name}
    [**[${lat!.toFixed(5)},${lon!.toFixed(5)}](https://www.google.com/maps?q=${lat},${lon})**]`;
}
export function parseQuestDb(quest: pokestop) {
	const { lat, lon, quest_type, quest_target } = quest;
	const city = nearbyCities({ latitude: lat, longitude: lon })[0];
	const emoji = countryFlagEmoji.get(city.country);
	return stripIndents`**Type:** ${questTypesData[quest_type!]!.split('{0}').join(`${quest_target ?? ' '}`)}
    ${emoji.emoji} ${emoji.name}
    [**[${lat.toFixed(5)},${lon.toFixed(5)}]](https://www.google.com/maps?q=${lat},${lon})**`;
}
export function parseWeatherDb(weather: weather) {
	const city = nearbyCities({
		latitude: weather.latitude,
		longitude: weather.longitude,
	})[0];
	const emoji = countryFlagEmoji.get(city.country);
	return stripIndents`${emoji.emoji} ${city.name}, ${emoji.name}
[**[${weather.latitude.toFixed(5)},${weather.longitude.toFixed(5)}](https://www.google.com/maps?q=${weather.latitude},${
		weather.longitude
	})**]\n`;
}
export function parseRaid(
	raid: RaidEventData,
	guildId: string,
	webhook: boolean,
	distanceFromPrevious: number | null,
): {
	embed: MessageEmbed;
	coordinates: number[];
} {
	const {
		gym_name,
		latitude,
		move_1,
		gender,
		gym_url,
		level,
		end,
		cp,
		longitude,
		pokemon_id,
		team_id,
		move_2,
		ex_raid_eligible,
	} = raid;

	const pokemon: PokemonData = pokemonData[pokemon_id ?? '']!;

	// calculating time when pokemon expires and remaining time until pokemon expires
	const disappearTime = moment.utc((end ?? 0) * 1000).tz(geoTz(latitude, longitude).toString());
	const now = moment.utc(moment.now()).tz(geoTz(latitude, longitude).toString());
	const duration = moment.preciseDiff(disappearTime, now);

	// looking up city, country and emoji location data
	const city = nearbyCities({
		latitude: latitude,
		longitude: longitude,
	})[0];
	const locationEmoji: LocationEmoji | undefined = countryFlagEmoji.get(city.country);

	const embed = client.embed(guildId);
	const typeData = pokemonTypesData[pokemon.types[0]];
	if (typeData) embed.setColor(typeData.color);

	// line 1: name and gender
	let description = `${`**${pokemon.name}**`}`;
	if (isValid(gender)) {
		const genderEmojiName: string | undefined = config.genderEmojis[`${gender!}`];
		let genderEmoji = emoji(genderEmojiName);
		// If no custom emoji found, name may be undefined,
		// or emoji will return the gender number as a string.
		if (genderEmojiName === undefined || genderEmoji === `${gender!}`) {
			switch (gender!) {
				case 1:
					genderEmoji = ':male_sign';
					break;
				case 2:
					genderEmoji = ':female_sign:';
					break;
				case 3:
					genderEmoji = 'genderless ⚧';
					break;
			}
		}
		description = `${description} ${genderEmoji!}`.trim();
	}

	// location emoji + city & name
	description += parseLocation(locationEmoji, city);

	// line 4: moveset
	if (isValid(move_1) && isValid(move_2)) {
		const moveOneName = movesData[move_1!]?.name ?? `Unknown move '${move_1!}'`;
		const moveTwoName = movesData[move_2!]?.name ?? `Unknown move '${move_2!}'`;
		description += `${emoji(config.statsEmojis.moveset)!} ${moveOneName}/${moveTwoName}\n`;
	}

	if (isValid(cp)) {
		description += `${emoji(config.statsEmojis.cp)!} ${cp!} | **Ends At:** ${disappearTime.format(
			'hh:mm:ss A',
		)} (${duration} left)\n`;
	}

	if (isValid(pokemon.types)) {
		description += `**Types:** ${pokemon.types
			.map((type) => {
				const typeData = pokemonTypesData[type]!;
				const weaknesses: string[] = typeData.weaknesses;
				return `${emoji(typeData.emoji) ?? typeData.emojiBackup} (**Weaknesses**: ${weaknesses
					.map((weakness: string) => emoji(typeData[weakness].emoji) ?? typeData[weakness].emojiBackup)
					.join(' ')})`;
			})
			.join(', ')}\n`;
	}

	if (isValid(level)) description += `**Level:** ${level!} | `;
	if (isValid(team_id)) description += `${emoji(teamsData[team_id!]?.name ?? '')!}`;
	if (isValid(ex_raid_eligible)) description += emoji('ex');
	description += `Gym\n`;
	if (isValid(distanceFromPrevious)) description += `**Distance From Previous**: ${distanceFromPrevious!}\n`;
	description += `${emoji(
		config.statsEmojis.google,
	)!}[[**Google**](https://www.google.com/maps?q=${latitude!},${longitude!})] ${emoji(
		config.statsEmojis.apple,
	)!} [[**Apple**](http://maps.apple.com/maps?daddr=${latitude!},${longitude!}&z=10&t=s&dirflg=d)]`;

	embed
		.setURL(gym_url!)
		.setThumbnail(
			`https://play.pokemonshowdown.com/sprites/xyani/${pokemon.name.split(' ').join('').toLowerCase()}.gif`,
		)
		.setAuthor(gym_name!, gym_url)
		.setDescription(description);
	return { embed: embed, coordinates: [latitude!, longitude!] };
}

export function parseRaidDb(raid: gym, guildId: string): MessageEmbed {
	const raidEvent: RaidEventData = {
		gym_name: raid.name,
		latitude: raid.lat,
		longitude: raid.lon,
		move_1: raid.raid_pokemon_move_1,
		move_2: raid.raid_pokemon_move_2,
		gender: raid.raid_pokemon_gender,
		gym_url: raid.url,
		level: raid.raid_level,
		end: raid.raid_end_timestamp,
		cp: raid.raid_pokemon_cp,
		pokemon_id: raid.raid_pokemon_id,
	};
	return parseRaid(raidEvent, guildId, true, null).embed;
}

export function parseQuest(
	quest: QuestEventData,
	guildId: string,
	webhook: boolean,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	expiryDate?: number,
): {
	embed: MessageEmbed;
	coordinates: number[];
} {
	const { latitude, longitude, pokestop_name, rewards } = quest;

	// let disappearTime: Moment;
	// let now: Moment;
	// let duration: string;
	// if (expiryDate) {
	// 	disappearTime = moment.utc(expiryDate * 1000).tz(geoTz(latitude, longitude).toString());
	// 	now = moment.utc(moment.now()).tz(geoTz(latitude, longitude).toString());
	// 	duration = moment.preciseDiff(disappearTime, now);
	// }

	// looking up city, country and emoji location data
	const city = nearbyCities({
		latitude: latitude,
		longitude: longitude,
	})[0];
	const locationEmoji: LocationEmoji | undefined = countryFlagEmoji.get(city.country);

	const embed = client.embed(guildId);
	if (webhook) embed.setTitle(`${pokestop_name ?? 'Unknown Pokestop'}`);
	embed.setURL(`https://www.google.com/maps?q=${latitude!},${longitude!})`);
	if (isNonEmptyArray(quest.rewards)) {
		const reward: QuestEventRewards = rewards![0];
		switch (reward.type) {
			case 2:
				embed.setThumbnail(
					`https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_${reward
						.info.item_id!}_1.png`,
				);
				break;
			case 3:
				embed.setThumbnail(
					`https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_stardust_${reward
						.info.amount!}.png`,
				);
				break;
			case 7:
				if (reward.info.pokemon_id)
					embed.setThumbnail(
						`https://raw.githubusercontent.com/nileplumb/PkmnHomeIcons/master/RDM_OS_128/pokemon/${reward.info.pokemon_id}.png`,
					);
				break;
			case 12:
				if (reward.info.pokemon_id)
					embed.setThumbnail(
						`https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_mega_energy_${reward.info.pokemon_id}.png`,
					);
				break;
		}
	}

	let description = '';
	if (isNonEmptyArray(quest.rewards)) description += `\n**Reward:** ${getQuestReward(quest)}\n`;
	if (isValid(quest.template)) description += `**Task**: ${getQuestTask(quest)}\n`;
	else description += '\n';

	if (isValid(locationEmoji))
		description += `${locationEmoji!.emoji} ${(city?.name as string) || 'Unknown City'}, ${locationEmoji!.name}\n`;

	description += `${emoji(
		config.statsEmojis.google,
	)!}[[**Google**](https://www.google.com/maps?q=${latitude!},${longitude!})] ${emoji(
		config.statsEmojis.apple,
	)!} [[**Apple**](http://maps.apple.com/maps?daddr=${latitude!},${longitude!}&z=10&t=s&dirflg=d)]`;

	embed.setDescription(description);

	return { embed: embed, coordinates: [latitude!, longitude!] };
}

export function parseInvasion(
	invasion: InvasionEventData,
	guildId: string,
	webhook: boolean,
): {
	embed: MessageEmbed;
	coordinates: number[];
} {
	const { latitude, longitude, grunt_type, name, url, incident_expire_timestamp } = invasion;

	const invasionGruntData = gruntTypesData[grunt_type];
	let disappearTime: Moment;
	let now: Moment;
	let duration: string;
	if (incident_expire_timestamp) {
		disappearTime = moment.utc(incident_expire_timestamp * 1000).tz(geoTz(latitude, longitude).toString());
		now = moment.utc(moment.now()).tz(geoTz(latitude, longitude).toString());
		duration = moment.preciseDiff(disappearTime, now);
	}

	// looking up city, country and emoji location data
	const city = nearbyCities({
		latitude: latitude,
		longitude: longitude,
	})[0];
	const locationEmoji = countryFlagEmoji.get(city.country);

	const embed = client.embed(guildId);
	if (webhook) embed.setTitle(`${(city?.name as string | undefined) ?? 'Unknown'}: ${name!}`);
	if (invasionGruntData?.type && pokemonTypesData[invasionGruntData.type]) {
		embed.setColor(pokemonTypesData[invasionGruntData.type]!.color);
	}
	embed.setURL(`https://www.google.com/maps?q=${latitude!},${longitude!})`);
	if (url) embed.setThumbnail(url);
	if (invasionGruntData?.image) embed.setThumbnail(invasionGruntData.image);

	let description = '';
	if (incident_expire_timestamp)
		description = `**Expires**: ${disappearTime!.format('hh:mm:ss A')} (${duration!} left)\n`;
	if (isValid(invasionGruntData?.type)) {
		const typeOutput = config.typeEmojis[invasionGruntData!.type]
			? emoji(config.typeEmojis[invasionGruntData!.type])
			: invasionGruntData!.type;
		description += `**Type:** ${typeOutput as string}`;
	}

	description += `**Gender** ${parseGender(invasionGruntData?.gender)}`;

	if (isValid(invasionGruntData?.grunt)) description += `**Grunt Type:** ${invasionGruntData?.grunt ?? 'Unknown'}\n`;

	description += parseLocation(locationEmoji, city);
	description += parseAppleGoogle(latitude!, longitude!);

	embed.setDescription(description);

	return { embed: embed, coordinates: [latitude!, longitude!] };
}

export function getQuestReward(quest: QuestEventData): string {
	const questReward = quest.rewards![0];
	switch (questReward.type) {
		case 7:
			return `Pokemon: ${proto.values[`poke_${questReward.info.pokemon_id!}`] as string}`;
		case 2:
			return `Item: ${questReward.info.item_id!}`;
		case 3:
			return `Stardust: ${questReward.info.amount!}`;
		case 12:
			return `Mega Energy: ${questReward.info.amount!} ${
				proto.values[`poke_${questReward.info.pokemon_id!}`] as string
			}`;
	}
	return '';
}

export function getQuestTask(quest: QuestEventData): string {
	const questTemplate: string = quest.template!.toLowerCase();
	const validConditions = isNonEmptyArray(quest.conditions);
	const validTargetAndConditions = validConditions && isValid(quest.target);
	const questTarget = quest.target ?? 'unknown target';
	// CATCHING SPECIFIC POKEMON
	if (questTemplate.includes('catch_specific')) {
		if (validTargetAndConditions && isNonEmptyArray(quest.conditions[0].info.pokemon_ids))
			return `Catch ${quest.target!} ${pokemonData[quest.conditions[0]!.info.pokemon_ids![0]!]!.name}`;
	}
	// CATCH POKEMON TYPES
	if (questTemplate.includes('catch_types')) {
		if (validTargetAndConditions && isNonEmptyArray(quest.conditions[0].info.pokemon_type_ids)) {
			let catch_types = '';
			quest.conditions[0].info.pokemon_type_ids!.forEach((type) => {
				catch_types += `${proto.values[`poke_type_${type}`] as string}, `;
			});
			catch_types = catch_types.slice(0, -2);
			return `Catch ${questTarget} ${catch_types} Type Pokémon.`;
		}
	}

	// CATCH WEATHER BOOSTED
	// This works for both catch_weather and jan_2021_catch_weather
	if (questTemplate.includes('catch_weather')) return `Catch ${questTarget} Weather Boosted Pokémon.`;
	if (questTemplate.includes('challenge_anniversary2020_weather'))
		return `Catch ${questTarget} Pokémon with Weather Boost.`;
	// CATCH POKEMON OTHER
	if (questTemplate.includes('catch')) {
		if (validConditions) {
			if (isNonEmptyArray(quest.conditions[0].info.pokemon_type_ids)) {
				return `Catch ${questTarget} ${
					proto.values[`poke_type_${quest.conditions[0]!.info.pokemon_type_ids![0]!}`] as string
				} Type Pokémon.`;
			}
			return `Catch ${questTarget} ${proto.values[`quest_condition_${quest.conditions[0].type!}`] as string} Pokémon.`;
		}
		return `Catch ${questTarget} Pokémon.`;
	}

	if (questTemplate.includes('challenge_catch_easy')) {
		return `Catch ${questTarget} Pokémon.`;
	}

	// LANDING SPECIFIC THROWS
	if (questTemplate.includes('land')) {
		let curveball = '';
		let throw_type = '';
		if (validConditions && isValid(quest.conditions[0].info.throw_type_id)) {
			throw_type = proto.values[`throw_type_${quest.conditions[0].info.throw_type_id!}`];
		}
		if (questTemplate.includes('curve')) {
			curveball = ' Curveball';
		}
		if (questTemplate.includes('inarow')) {
			return `Perform ${questTarget} ${throw_type}${curveball} Throw(s) in a Row.`;
		}
		return `Perform ${questTarget} ${throw_type}${curveball} Throw(s).`;
	}

	// COMPLETE RAIDS
	if (questTemplate.includes('raid')) {
		if (validConditions) {
			if (quest.conditions[0].type === 6) return `Battle in ${questTarget} Raid(s).`;
			return `Win ${questTarget} Level ${quest.conditions[0]!.info.raid_levels as string} Raid(s).`;
		}
		return `Battle in ${questTarget} Raid.`;
	}

	// SEND GIFTS TO FRIENDS
	if (questTemplate.includes('gifts')) {
		return `Send ${questTarget} Gift(s) to Friends.`;
	}
	if (questTemplate.includes('gift')) {
		return `Send ${questTarget} Gift to a Friend.`;
	}

	// NEW 2021-Quests
	if (questTemplate.includes('quest_gen2_jan21_grass')) {
		return `Catch ${questTarget}Grass Type Pokémon.`;
	}
	if (questTemplate.includes('jan_2021_catch_fire')) {
		return `Catch ${questTarget}Fire Type Pokémon.`;
	}

	if (questTemplate.includes('challenge_catch_easy')) {
		return `Catch ${questTarget} Pokémon.`;
	}

	if (questTemplate.includes('gym')) {
		if (questTemplate.includes('easy') || questTemplate.includes('try')) {
			return `Battle ${questTarget} Time(s) in a Gym.`;
		}
		if (questTemplate.includes('win')) {
			return `Win ${questTarget} Gym Battle(s).`;
		}
	}

	// CATCH WITH PINAP
	if (questTemplate.includes('berry_pinap')) {
		return `Catch ${questTarget} Pokémon With a Pinap Berry.`;
	}

	// CATCH WITH NANAB
	if (questTemplate.includes('t2_2019_berry_nanab_pkmn')) {
		return `Catch ${questTarget} Pokémon With a Nanab Berry.`;
	}

	if (questTemplate.includes('t3_2019__berry_nanab_pkmn')) {
		return `Use ${questTarget} Nanab berry to help catch Pokémon.`;
	}

	// CATCH WITH RAZZ, CATCH WITH ANY BERRY
	if (questTemplate.includes('berry_razz') || questTemplate.includes('berry_easy')) {
		return `Catch ${questTarget} Pokémon With a Razz Berry.`;
	}

	if (questTemplate.includes('challenge_berry_moderate')) {
		return `Catch ${questTarget} Pokémon With Any Berry.`;
	}

	if (questTemplate.includes('challenge_anniversary2020_berry')) {
		return `Use ${questTarget} berries to help catch Pokémon.`;
	}

	// HATCH EGGS
	if (questTemplate.includes('hatch')) {
		if (questTarget > 1) {
			return `Hatch ${questTarget} Eggs.`;
		}
		return `Hatch ${questTarget} Egg.`;
	}

	// SPIN POKESTOPS
	if (questTemplate.includes('spin')) {
		return `Spin ${questTarget} Pokéstops.`;
	}

	if (questTemplate.includes('evolve')) {
		if (
			questTemplate.includes('specific_plural') &&
			validConditions &&
			isNonEmptyArray(quest.conditions[0].info.pokemon_ids)
		) {
			let quest_pokemon = '';
			for (const pid of quest.conditions[0].info.pokemon_ids!) {
				quest_pokemon += `${pokemonData[pid]?.name ?? `<Unknown id ${pid}`}, `;
			}
			return `Evolve a ${quest_pokemon.slice(0, -2)}`;
		}
		if (questTemplate.includes('item')) {
			return `Evolve ${questTarget} Pokémon with an Evolution Item.`;
		}
		return `Evolve ${questTarget} Pokémon.`;
	}

	// BUDDY TASKS
	if (questTemplate.includes('buddy')) {
		return `Get ${questTarget} Candy from Walking a Pokémon Buddy.`;
	}
	if (questTemplate.includes('feed_treat')) {
		return 'Give your buddy 3 treats';
	}

	// POWER UP POKEMON
	if (questTemplate.includes('powerup')) {
		return `Power Up ${questTarget} Pokémon.`;
	}
	if (questTemplate.includes('challenge_mega_energy_power_up')) {
		return 'Power Up a Pokémon 5 times.';
	}

	// TRADE POKEMON
	if (questTemplate.includes('trade')) {
		return `Perform ${questTarget} Trade(s) with a Friend.`;
	}

	// TRANSFER POKEMON
	if (questTemplate.includes('transfer')) {
		return `Transfer ${questTarget} Pokémon.`;
	}

	// USE SPECIFIC CHARGE MOVES
	if (questTemplate.includes('charge')) {
		return `Use a Super Effective Charge Move ${questTarget} Times.`;
	}
	// SNAPSHOTS
	if (questTemplate.includes('snapshot')) {
		if (questTemplate.includes('easy') && validConditions && isNonEmptyArray(quest.conditions[0].info.pokemon_ids)) {
			return `Take ${questTarget} Snapshots of ${
				pokemonData[quest.conditions[0]!.info.pokemon_ids![0]]?.name ?? 'Unknown'
			}`;
		}
		if (questTemplate.includes('gen2_jan21')) {
			return `Take ${questTarget} Snapshots`;
		}
	}

	// PvP
	if (questTemplate.includes('pvp_participate_hard')) {
		return `Win ${questTarget} PvP Battles`;
	}
	if (questTemplate.includes('gbl_win')) {
		return 'Win in the Go Battle League';
	}
	if (questTemplate.includes('challenge_megasept2020_battle_energy')) {
		return 'Battle another trainer';
	}

	// PvE
	if (questTemplate.includes('pve_participate_medium')) {
		return `Battle a team leader ${questTarget} times`;
	}

	// TEAM ROCKET (HALLOWEEN 2019)
	if (questTemplate.includes('rocket')) {
		return 'Defeat a Team GO Rocket Grunt';
	}

	// GRUNT TYPE
	if (questTemplate.includes('grunt')) {
		return `Battle against${questTarget}Team GO Rocket Grunt(s)`;
	}
	if (questTemplate.includes('quest_tgr_feb21_grunt')) {
		return `Battle against${questTarget}Team GO Rocket Grunt(s)`;
	}
	if (questTemplate.includes('feb_2021_battle_gbl')) {
		return `Complete ${questTarget}PVP Battles`;
	}

	// feb 21
	if (questTemplate.includes('challenge_feb21_community_day')) {
		return `Catch ${questTarget} Pokemon`;
	}
	if (questTemplate.includes('quest_tgr_feb21_purify')) {
		return `Purify ${questTarget} Pokemon`;
	}

	client.logger.error(`Update for this quest (${quest.pokestop_id ?? 'undefined'})`, { quest, questTarget });
	return 'UPDATE FOR THIS QUEST';
}
