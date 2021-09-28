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
import masterfile from '../util/masterfile.json';
import util from '../util/util.json';
import { InvasionEventData, PokemonEventData, QuestEventData, QuestEventRewards, RaidEventData } from '../routes/hook';
import { isInvalid, isNonEmptyArray, isValid } from '../routes/filters';

export interface LocationEmoji {
	name: string;
	emoji: string;
}
export interface RankingData {
	rank?: number;
	name?: string;
	cp?: number;
	level?: number;
	percentage?: number;
}

export interface PokemonDataEvolution {
	pokemon: number;
	form?: number;
	gender_reequirement?: number;
}

export interface PokemonDataType {
	attack?: number;
	buddy_distance?: number;
	buddy_group_number?: number;
	capture_rate?: number;
	charged_moves?: string[];
	default_form_id?: number;
	defense?: number;
	evolutions?: PokemonDataEvolution[];
	flee_rate?: number;
	forms?: any[];
	gym_defender_eligible?: boolean;
	height?: number;
	legendary?: boolean;
	mythic?: boolean;
	name: string;
	pokedex_id?: number;
	quick_moves?: string[];
	stamina?: number;
	temp_evolutions?: any[];
	third_move_candy?: number;
	third_move_stardust?: number;
	types?: string[];
	weight?: number;
}

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

const parseLocation = (locationEmoji: LocationEmoji | undefined, city) => {
	if (isValid(locationEmoji)) {
		return `**${locationEmoji!.emoji} ${(city?.name as string | undefined) ?? 'unknown'}, ${locationEmoji!.name}**\n`;
	}
	return '';
};

const parseAppleGoogle = (latitude: number, longitude: number) => {
	return `${emoji(
		config.statsEmojis.google,
	)!} [[**Google**](https://www.google.com/maps?q=${latitude},${longitude})] ${emoji(
		config.statsEmojis.apple,
	)!} [[**Apple**](http://maps.apple.com/maps?daddr=${latitude},${longitude}&z=10&t=s&dirflg=d)]`;
};

export function parsePokemon(
	pokemon: PokemonEventData,
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
	} = pokemon;
	const pokemonData: PokemonDataType | undefined = masterfile.pokemon[`${pokemon_id!}`];
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
	// TODO: Define a pokemonData type based on the data in the file.
	if (!webhook)
		embed.setTitle(`${pokemonData ? pokemonData.name : ''} ${latitude!.toFixed(5)},${longitude!.toFixed(5)}`);
	if (pokemonData?.types) embed.setColor(`#${util.types[pokemonData.types[0]].color.toString(16) as string}`);
	if (pokemonData)
		embed.setThumbnail(
			`https://play.pokemonshowdown.com/sprites/xyani/${pokemonData.name.toLowerCase().split(' ').join('')}.gif`,
		);

	// line 1: name and gender
	let description = `${pokemonData ? `**${pokemonData.name}**` : ''}`;
	description = `${description} ${parseGender(gender)}`.trim();

	// line 2, 3: cp, iv and 1v1
	if (isValid(cp) && isValid(iv) && isValid(pokemon_level)) {
		description += `\n${emoji(config.statsEmojis.cp)!} **${cp!}**\n${emoji(
			emoji(config.statsEmojis.iv),
		)!} **${iv!.toFixed(1)}%*`;
		if (isValid(individual_attack) && isValid(individual_defense) && isValid(individual_stamina)) {
			description += ` **(${individual_attack!}/${individual_defense!}/${individual_stamina!})**\n`;
		}
		description += `${emoji(config.statsEmojis.level)!} **${pokemon_level ?? ''}**\n`;
	}

	// line 4: moveset
	if (isValid(move_1) && isValid(move_2)) {
		description += `${emoji(config.statsEmojis.moveset)!} ${masterfile.moves[`${move_1!}`].name as string}/${
			masterfile.moves[`${move_2!}`].name as string
		}\n`;
	}

	// line 5: despawn time and time remaining
	description += `${emoji(config.statsEmojis.despawn)!}: ${duration}\n`;
	const pokemonDataIsValid = isValid(pokemonData);
	const pokemonDataTypesAreValid = isValid(pokemonData?.types);
	// line 6: types and weather
	if (pokemonDataIsValid && pokemonDataTypesAreValid) {
		description += `**Types:** ${pokemonData!
			.types!.map((type) => {
				return emoji(config.typeEmojis[type]) === config.typeEmojis[type]
					? util.types[type].emoji
					: emoji(config.typeEmojis[type]);
			})
			.join(' ')} `;
	}

	if (weather !== 0 && isValid(weather)) {
		description += `| **Weather:** `;
		const weatherString = `${weather!}`;
		const weatherEmoji = emoji(config.weatherEmojis[weatherString]);
		const utilWeatherName = util.weather[weatherString].name ?? '';
		if (weatherEmoji === weatherString) {
			description += `${util.weather[weatherString].emoji as string}`;
		} else {
			description += `${weatherEmoji!}`;
		}
		if (util.weather[weatherString]) {
			description += utilWeatherName;
		}
		if (
			pokemonDataIsValid &&
			pokemonDataTypesAreValid &&
			pokemonData!.types!.some((type) => (boosted[utilWeatherName] ?? []).includes(type))
		) {
			description += `**BOOSTED**`;
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
					const p: PokemonDataType | undefined = masterfile.pokemon[`${ranking.pokemon}`];
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
					const p: PokemonDataType | undefined = masterfile.pokemon[`${ranking.pokemon}`];
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
		message: `${emoji(`pokemon_${pokemon_id!}`)!} ${pokemonData!.name} | ${latitude?.toFixed(5) ?? 'unknown'},${
			longitude?.toFixed(5) ?? 'unknown'
		}`,
	};
}

export async function parseShinyPokemon(pokemon: PokemonEventData, guildId: string) {
	const {
		pokemon_id,
		cp,
		pokemon_level,
		latitude,
		longitude,
		individual_attack,
		individual_defense,
		individual_stamina,
		username,
		move_1,
		move_2,
		disappear_time,
	} = pokemon;
	let iv = '';
	if (isValid(individual_attack) && isValid(individual_defense) && isValid(individual_stamina)) {
		iv = (((individual_attack! + individual_defense! + individual_stamina!) / 45) * 100).toFixed(1);
	}
	const pokemonData: PokemonDataType = masterfile.pokemon[`${pokemon_id!}`];
	const user = config.shinyMentions[username];
	let member;
	if (user) member = await client.guilds.cache.get(guildId)?.members.fetch(user.substring(2, user.length - 1));

	if (isInvalid(member)) return null;
	// calculating time when pokemon expires and remaining time until pokemon expires
	const disappearTime = moment.utc(disappear_time ?? 0 * 1000).tz(geoTz(latitude, longitude).toString());
	const now = moment.utc(moment.now()).tz(geoTz(latitude, longitude).toString());
	const duration = moment.preciseDiff(disappearTime, now);

	const embed = client.embed(guildId);
	if (isValid(pokemonData.types) && pokemonData.types!.length > 0) {
		const color: number = util.types[pokemonData.types![0]].color;
		embed.setColor(`#${color.toString(16)}`);
	}
	embed
		.setAuthor(`${member.user.username as string} found shiny ${pokemonData.name}`)
		.setThumbnail(
			`https://play.pokemonshowdown.com/sprites/xyani/${pokemonData.name.toLowerCase().split(' ').join('')}.gif`,
		)
		.setDescription(
			stripIndents`${emoji(config.statsEmojis.shiny.cp)} ${cp} ${emoji(config.statsEmojis.shiny.iv)} ${iv} ${emoji(
				config.statsEmojis.shiny.level,
			)} ${pokemon_level} ${emoji(config.statsEmojis.shiny.shiny)}
    ${emoji(config.statsEmojis.shiny.moveset)} ${masterfile.moves[`${move_1!}`].name} | ${
				masterfile.moves[`${move_2!}`].name
			}
      ${emoji(config.statsEmojis.shiny.despawn)} ${duration}
      ${parseAppleGoogle(latitude!, longitude!)} [[**iPogo**](https://ipogo.app/?coords=${latitude},${longitude})]`,
		);

	return {
		embed: embed,
		message: `${latitude!.toFixed(5)},${longitude!.toFixed(5)} | ${user as string} | ${pokemonData.name}`,
		shiny: true,
		user: user,
	};
}

export function parsePokemonDb(pokemon, guildId: string, webhook: boolean): MessageEmbed {
	pokemon.dataValues.pokemon_level = pokemon.dataValues.level;
	pokemon.dataValues.latitude = pokemon.dataValues.lat;
	pokemon.dataValues.longitude = pokemon.dataValues.lon;
	pokemon.dataValues.individual_attack = pokemon.dataValues.atk_iv;
	pokemon.dataValues.individual_defense = pokemon.dataValues.def_iv;
	pokemon.dataValues.individual_stamina = pokemon.dataValues.sta_iv;
	pokemon.dataValues.disappear_time = pokemon.dataValues.expire_timestamp;
	pokemon.dataValues.pvp_rankings_great_league = JSON.parse(pokemon.dataValues.pvp_rankings_great_league);
	pokemon.dataValues.pvp_rankings_ultra_league = JSON.parse(pokemon.dataValues.pvp_rankings_ultra_league);
	return parsePokemon(pokemon.dataValues, guildId, webhook).embed;
}
export function parseNestDb(nest): { value: string } {
	const { lat, lon } = nest;
	const city = nearbyCities({ latitude: lat, longitude: lon })[0];
	const emoji = countryFlagEmoji.get(city.country);
	return {
		value: stripIndents`${emoji.emoji} ${city.name}, ${emoji.name}
    [**[${lat.toFixed(5)},${lon.toFixed(5)}](https://www.google.com/maps?q=${lat},${lon})**]`,
	};
}
export function parseQuestDb(quest): { value: string } {
	const { lat, lon, quest_type, quest_target } = quest;
	const city = nearbyCities({ latitude: lat, longitude: lon })[0];
	const emoji = countryFlagEmoji.get(city.country);
	return {
		value: stripIndents`**Type:** ${masterfile.quest_types[`${quest_type as number}`].type
			.split('{0}')
			.join(quest_target)}
    ${emoji.emoji} ${emoji.name}
    [**[${lat.toFixed(5)},${lon.toFixed(5)}](https://www.google.com/maps?q=${lat},${lon})**]`,
	};
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

	const pokemonData: PokemonDataType = masterfile.pokemon[`${pokemon_id ?? ''}`];

	// calculating time when pokemon expires and remaining time until pokemon expires
	const disappearTime = moment.utc(end * 1000).tz(geoTz(latitude, longitude).toString());
	const now = moment.utc(moment.now()).tz(geoTz(latitude, longitude).toString());
	const duration = moment.preciseDiff(disappearTime, now);

	// looking up city, country and emoji location data
	const city = nearbyCities({
		latitude: latitude,
		longitude: longitude,
	})[0];
	const locationEmoji: LocationEmoji | undefined = countryFlagEmoji.get(city.country);

	const embed = client.embed(guildId);
	if (isValid(pokemonData.types) && pokemonData.types!.length > 0) {
		const color: number = util.types[pokemonData.types![0]].color;
		embed.setColor(`#${color.toString(16)}`);
	}

	// line 1: name and gender
	let description = `${`**${pokemonData.name}**`}`;
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
		description += `${emoji(config.statsEmojis.moveset)!} ${masterfile.moves[`${move_1!}`].name as string}/${
			masterfile.moves[`${move_2!}`].name as string
		}\n`;
	}

	if (isValid(cp)) {
		description += `${emoji(config.statsEmojis.cp)!} ${cp!} | **Ends At:** ${disappearTime.format(
			'hh:mm:ss A',
		)} (${duration} left)\n`;
	}

	if (isValid(pokemonData.types)) {
		description += `**Types:** ${pokemonData
			.types!.map((type) => {
				const weaknesses: string[] = util.typeWeaknesses[type].weaknesses;
				return `${emoji(config.typeEmojis[type])!} (**Weaknesses**: ${weaknesses
					.map((weakness: string) => emoji(config.typeEmojis[weakness])!)
					.join(' ')})`;
			})
			.join(', ')}\n`;
	}

	if (isValid(level)) description += `**Level:** ${level!} | `;
	if (isValid(team_id)) description += `${emoji(config.teamEmojis[util.teams[`${team_id!}`].name])!}`;
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
			`https://play.pokemonshowdown.com/sprites/xyani/${pokemonData.name.split(' ').join('').toLowerCase()}.gif`,
		)
		.setAuthor(gym_name!, gym_url)
		.setDescription(description);
	return { embed: embed, coordinates: [latitude!, longitude!] };
}

export function parseRaidDb(raid, guildId: string): MessageEmbed {
	raid.dataValues.gym_name = raid.dataValues.name;
	raid.dataValues.latitude = raid.dataValues.lat;
	raid.dataValues.longitude = raid.dataValues.lon;
	raid.dataValues.move_1 = raid.dataValues.raid_pokemon_move_1;
	raid.dataValues.move_2 = raid.dataValues.raid_pokemon_move_2;
	raid.dataValues.gender = raid.dataValues.raid_pokemon_gender;
	raid.dataValues.gym_url = raid.dataValues.url;
	raid.dataValues.level = raid.dataValues.raid_level;
	raid.dataValues.end = raid.dataValues.raid_end_timestamp;
	raid.dataValues.cp = raid.dataValues.raid_pokemon_cp;
	raid.dataValues.pokemon_id = raid.dataValues.raid_pokemon_id;
	return parseRaid(raid.dataValues, guildId, true, null).embed;
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
	const { latitude, longitude, type, pokestop_name, rewards } = quest;

	const questData = masterfile.quest_types[`${type!}`];
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
	const questTypeColor: number | undefined = isValid(questData?.type) ? util.types[questData.type].color : undefined;
	if (isValid(questTypeColor)) embed.setColor(`#${questTypeColor!.toString(16)}`);
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
	if (isValid(quest.gender)) description += `**Gender** ${parseGender(quest.gender)!}`.trim();
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

	const invasionData = masterfile.grunt_types[`${grunt_type}`];
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
	if (isValid(invasionData?.type) && invasionData.types[invasionData.type]) {
		const color: number = util.types[invasionData.type!].color;
		embed.setColor(`#${color.toString(16)}`);
	}
	embed.setURL(`https://www.google.com/maps?q=${latitude!},${longitude!})`);
	if (url) embed.setThumbnail(url);
	if (invasionData && util.gruntImages[invasionData.grunt]) embed.setThumbnail(util.gruntImages[invasionData.grunt]);
	if (invasionData && util.gruntImages[invasionData.type]) embed.setThumbnail(util.gruntImages[invasionData.type]);

	let description = '';
	if (incident_expire_timestamp)
		description = `**Expires**: ${disappearTime!.format('hh:mm:ss A')} (${duration!} left)\n`;
	if (isValid(invasionData?.type)) {
		const typeOutput = config.typeEmojis[invasionData.type]
			? emoji(config.typeEmojis[invasionData.type])
			: invasionData.type;
		description += `**Type:** ${typeOutput as string}`;
	}

	description += `**Gender** ${parseGender(invasionData.gender)}`;

	if (isValid(invasionData?.grunt)) description += `**Grunt Type:** ${invasionData.grunt as string}\n`;

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
		if (validTargetAndConditions && isNonEmptyArray(quest.conditions[0].info?.pokemon_ids))
			return `Catch ${quest.target!} ${
				masterfile.pokemon[quest.conditions[0]!.info.pokemon_ids![0]!]!.name! as string
			}`;
	}
	// CATCH POKEMON TYPES
	if (questTemplate.includes('catch_types')) {
		if (validTargetAndConditions && isNonEmptyArray(quest.conditions[0].info?.pokemon_type_ids)) {
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
			if (isNonEmptyArray(quest.conditions[0].info?.pokemon_type_ids)) {
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
		if (validConditions && isValid(quest.conditions[0].info?.throw_type_id)) {
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
			isNonEmptyArray(quest.conditions[0].info?.pokemon_ids)
		) {
			let quest_pokemon = '';
			for (const pid of quest.conditions[0].info.pokemon_ids!) {
				quest_pokemon += `${(masterfile.pokemon[pid]?.name as string | undefined) ?? `<Unknown id ${pid}`}, `;
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
		if (questTemplate.includes('easy') && validConditions && isNonEmptyArray(quest.conditions[0].info?.pokemon_ids)) {
			return `Take ${questTarget} Snapshots of ${
				masterfile.pokemon[quest.conditions[0]!.info.pokemon_ids![0]].name as string
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
