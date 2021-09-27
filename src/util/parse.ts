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
import { PokemonEventData, QuestEventData, QuestEventRewards, RaidEventData } from '../routes/hook copy';
import { isInvalid, isValid } from '../routes/filters';

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
	const dissapearTime = moment.utc(disappear_time! * 1000).tz(geoTz(latitude, longitude).toString());
	const now = moment.utc(moment.now()).tz(geoTz(latitude, longitude).toString());
	const duration = moment.preciseDiff(dissapearTime, now);

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
	if (gender !== undefined && gender !== null) {
		const genderEmojiName: string | undefined = config.genderEmojis[`${gender}`];
		let genderEmoji = emoji(genderEmojiName);
		// If no custom emoji found, name may be undefined,
		// or emoji will return the gender number as a string.
		if (genderEmojiName === undefined || genderEmoji === `${gender}`) {
			switch (gender) {
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
	if (isValid(locationEmoji)) {
		description += `**${locationEmoji!.emoji} ${(city?.name as string | undefined) ?? 'unknown'}, ${
			locationEmoji!.name
		}**\n`;
	}

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

	description += `${emoji(
		config.statsEmojis.google,
	)!}[[**Google**](https://www.google.com/maps?q=${latitude!},${longitude!})] ${emoji(
		config.statsEmojis.apple,
	)!} [[**Apple**](http://maps.apple.com/maps?daddr=${latitude!},${longitude!}&z=10&t=s&dirflg=d)]`;

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
	const dissapearTime = moment.utc(disappear_time ?? 0 * 1000).tz(geoTz(latitude, longitude).toString());
	const now = moment.utc(moment.now()).tz(geoTz(latitude, longitude).toString());
	const duration = moment.preciseDiff(dissapearTime, now);

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
      ${emoji(
				config.statsEmojis.google,
			)} [[**Google**](https://www.google.com/maps?q=${latitude},${longitude})] ${emoji(
				config.statsEmojis.ipogo,
			)} [[**iPogo**](https://ipogo.app/?coords=${latitude},${longitude})]`,
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
	const dissapearTime = moment.utc(end * 1000).tz(geoTz(latitude, longitude).toString());
	const now = moment.utc(moment.now()).tz(geoTz(latitude, longitude).toString());
	const duration = moment.preciseDiff(dissapearTime, now);

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
	if (isValid(locationEmoji)) {
		description += `**${locationEmoji!.emoji} ${(city?.name as string | undefined) ?? 'unknown'}, ${
			locationEmoji!.name
		}**\n`;
	}

	// line 4: moveset
	if (isValid(move_1) && isValid(move_2)) {
		description += `${emoji(config.statsEmojis.moveset)!} ${masterfile.moves[`${move_1!}`].name as string}/${
			masterfile.moves[`${move_2!}`].name as string
		}\n`;
	}

	if (isValid(cp)) {
		description += `${emoji(config.statsEmojis.cp)!} ${cp!} | **Ends At:** ${dissapearTime.format(
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
	// let dissapearTime: Moment;
	// let now: Moment;
	// let duration: string;
	// if (expiryDate) {
	// 	dissapearTime = moment.utc(expiryDate * 1000).tz(geoTz(latitude, longitude).toString());
	// 	now = moment.utc(moment.now()).tz(geoTz(latitude, longitude).toString());
	// 	duration = moment.preciseDiff(dissapearTime, now);
	// }

	// looking up city, country and emoji location data
	const city = nearbyCities({
		latitude: latitude,
		longitude: longitude,
	})[0];
	const locationEmoji = countryFlagEmoji.get(city.country);

	const embed = client.embed(guildId);
	if (webhook) embed.setTitle(`${pokestop_name}`);
	const questTypeColor: number | undefined = isValid(questData?.type) ? util.types[questData.type].color : undefined;
	if (isValid(questTypeColor)) embed.setColor(`#${questTypeColor!.toString(16)}`);
	embed.setURL(`https://www.google.com/maps?q=${latitude!},${longitude!})`);
	if (Array.isArray(rewards) && rewards.length > 0) {
		const reward: QuestEventRewards = rewards[0];
		switch (reward.type) {
			case 2:
				embed.setThumbnail(
					`https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_${reward.info.item_id!}_1.png`,
				);
				break;
			case 3:
				embed.setThumbnail(
					`https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_stardust_${reward.info.amount!}.png`,
				);
				break;
			case 7:
				if (reward.info.pokemon_id)
					embed.setThumbnail(
						`https://raw.githubusercontent.com/nileplumb/PkmnHomeIcons/master/RDM_OS_128/pokemon/${reward.info.pokemon_id!}.png`,
					);
				break;
			case 12:
				if (reward.info.pokemon_id)
					embed.setThumbnail(
						`https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_mega_energy_${reward.info.pokemon_id!}.png`,
					);
				break;
		}
	}

	let description = '';
	if (isValid(questData)) {
		const { gender, type, } = questData;
		if (isValid(gender)) {
			description += `**Gender** `;
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
		}
	}
	if (isValid(gender)) {

		// If no custom emoji found, name may be undefined,
		// or emoji will return the gender number as a string.

		description = `${description} ${genderEmoji!}`.trim();
	}
	embed.setDescription(
		// line 1: gender
		`${
			questData && questData.gender
				? `**Gender** ${
						questData.gender
							? `${
									config.genderEmojis
										? emoji(config.genderEmojis[`${questData.gender}`])
										: questData.gender === 1
										? ':male_sign:'
										: questData.gender === 2
										? ':female_sign:'
										: questData.gender === 3
										? 'genderless ⚧'
										: ''
							  }\n`
							: ''
				  }`
				: ''
		}\n${
			// remaining lines: encounter reward chances
			questData && questData.type ? `**Reward:** ${getQuestReward(quest)}\n **Task**: ${getQuestTask(quest)}\n` : ''
		}${locationEmoji.emoji} ${city.name}, ${locationEmoji.name}\n` +
			`${emoji(
				config.statsEmojis.google,
			)} [[**Google**](https://www.google.com/maps?q=${latitude},${longitude})] ${emoji(
				config.statsEmojis.apple,
			)} [[**Apple**](http://maps.apple.com/maps?daddr=${latitude},${longitude}&z=10&t=s&dirflg=d)]`,
	);

	return { embed: embed, coordinates: [latitude, longitude] };
}

export function parseInvasion(
	invasion,
	guildId: string,
	webhook: boolean,
): {
	embed: MessageEmbed;
	coordinates: number[];
} {
	const { latitude, longitude, grunt_type, name, url, incident_expire_timestamp } = invasion;

	const invasionData = masterfile.grunt_types[`${grunt_type}`];
	let dissapearTime: Moment;
	let now: Moment;
	let duration: string;
	if (incident_expire_timestamp) {
		dissapearTime = moment.utc(incident_expire_timestamp * 1000).tz(geoTz(latitude, longitude).toString());
		now = moment.utc(moment.now()).tz(geoTz(latitude, longitude).toString());
		duration = moment.preciseDiff(dissapearTime, now);
	}

	// looking up city, country and emoji location data
	const city = nearbyCities({
		latitude: latitude,
		longitude: longitude,
	})[0];
	const locationEmoji = countryFlagEmoji.get(city.country);

	const embed = client.embed(guildId);
	if (webhook) embed.setTitle(`${city.name}: ${name}`);
	if (invasionData && invasionData.type && util.types[invasionData.type])
		embed.setColor(`#${util.types[invasionData.type].color.toString(16)}`);
	embed.setURL(`https://www.google.com/maps?q=${latitude},${longitude})`);
	if (url) embed.setThumbnail(url);
	if (invasionData && util.gruntImages[invasionData.grunt]) embed.setThumbnail(util.gruntImages[invasionData.grunt]);
	if (invasionData && util.gruntImages[invasionData.type]) embed.setThumbnail(util.gruntImages[invasionData.type]);

	embed.setDescription(
		// line 1: expiry date
		`${
			incident_expire_timestamp ? `**Expires**: ${dissapearTime.format('hh:mm:ss A')} (${duration} left)\n` : ''
			// line 2: type and gender
		}${
			invasionData && invasionData.type
				? `**Type:** ${
						config.typeEmojis[invasionData.type] ? emoji(config.typeEmojis[invasionData.type]) : invasionData.type
				  }`
				: ''
		} ${
			invasionData && invasionData.gender
				? `**Gender** ${
						invasionData.gender
							? `${
									config.genderEmojis
										? emoji(config.genderEmojis[`${invasionData.gender}`])
										: invasionData.gender === 1
										? ':male_sign:'
										: invasionData.gender === 2
										? ':female_sign:'
										: invasionData.gender === 3
										? 'genderless ⚧'
										: ''
							  }\n`
							: ''
				  }`
				: ''
		}${
			// remaining lines: encounter reward chances
			invasionData && invasionData.grunt ? `**Grunt Type:** ${invasionData.grunt}\n` : ''
		}${locationEmoji.emoji} ${city.name}, ${locationEmoji.name}\n` +
			`${emoji(
				config.statsEmojis.google,
			)} [[**Google**](https://www.google.com/maps?q=${latitude},${longitude})] ${emoji(
				config.statsEmojis.apple,
			)} [[**Apple**](http://maps.apple.com/maps?daddr=${latitude},${longitude}&z=10&t=s&dirflg=d)]`,
	);

	return { embed: embed, coordinates: [latitude, longitude] };
}

export function getQuestReward(quest): string {
	if (quest.rewards[0].type == 7) {
		return `Pokemon: ${proto.values[`poke_${quest.rewards[0].info.pokemon_id}`]}`;
	}
	if (quest.rewards[0].type == 2) {
		return `Item: ${quest.rewards[0].info.item_id}`;
	}
	if (quest.rewards[0].type == 3) {
		return `Stardust: ${quest.rewards[0].info.amount}`;
	}
	if (quest.rewards[0].type == 12) {
		return `Mega Energy: ${quest.rewards[0].info.amount} ${proto.values[`poke_${quest.rewards[0].info.pokemon_id}`]}`;
	}
}

export function getQuestTask(quest): string {
	switch (true) {
		// CATCHING SPECIFIC POKEMON
		case quest.template.indexOf('catch_specific') >= 0:
			if (quest.conditions[0].info && quest.conditions[0].info.pokemon_ids) {
				return `Catch ${quest.target} ${masterfile.pokemon[quest.conditions[0].info.pokemon_ids[0]].name}.`;
			}

		// CATCH POKEMON TYPES
		case quest.template.indexOf('catch_types') >= 0:
			if (quest.conditions[0].info && quest.conditions[0].info.pokemon_type_ids) {
				let catch_types = '';
				quest.conditions[0].info.pokemon_type_ids.forEach((type, index) => {
					catch_types += `${proto.values[`poke_type_${type}`]}, `;
				});
				catch_types = catch_types.slice(0, -2);
				return `Catch ${quest.target} ${catch_types} Type Pokémon.`;
			}

		// CATCH WEATHER BOOSTED
		case quest.template.indexOf('catch_weather') >= 0:
		case quest.template.indexOf('jan_2021_catch_weather') >= 0:
			return `Catch ${quest.target} Weather Boosted Pokémon.`;
		case quest.template.indexOf('challenge_anniversary2020_weather') >= 0:
			return `Catch ${quest.target} Pokémon with Weather Boost.`;
		// CATCH POKEMON OTHER
		case quest.template.indexOf('catch') >= 0:
			if (quest.conditions && quest.conditions[0]) {
				if (quest.conditions[0].info && quest.conditions[0].info.pokemon_type_ids[0]) {
					return `Catch ${quest.target} ${
						proto.values[`poke_type_${quest.conditions[0].info.pokemon_type_ids[0]}`]
					} Type Pokémon.`;
				}
				return `Catch ${quest.target} ${proto.values[`quest_condition_${quest.conditions[0].type}`]} Pokémon.`;
			}
			return `Catch ${quest.target} Pokémon.`;

		case quest.template.indexOf('challenge_catch_easy') >= 0:
			return `Catch ${quest.target} pokemon`;

		// LANDING SPECIFIC THROWS
		case quest.template.indexOf('land') >= 0:
			let curveball = '';
			let throw_type = '';
			if (proto.values[`throw_type_${quest.conditions[0].info.throw_type_id}`]) {
				throw_type = proto.values[`throw_type_${quest.conditions[0].info.throw_type_id}`];
			}
			if (quest.template.indexOf('curve') >= 0) {
				curveball = ' Curveball';
			}
			if (quest.template.indexOf('inarow') >= 0) {
				return `Perform ${quest.target} ${throw_type}${curveball} Throw(s) in a Row.`;
			}
			return `Perform ${quest.target} ${throw_type}${curveball} Throw(s).`;

		// COMPLETE RAIDS
		case quest.template.indexOf('raid') >= 0:
			if (!quest.conditions[0]) {
				return `Battle in ${quest.target} Raid.`;
			} else if (quest.conditions[0].type == 6) {
				return `Battle in ${quest.target} Raid(s).`;
			}
			return `Win ${quest.target} Level ${quest.conditions[0].info.raid_levels} Raid(s).`;

		// SEND GIFTS TO FRIENDS
		case quest.template.indexOf('gifts') >= 0:
			return `Send ${quest.target} Gift(s) to Friends.`;
		case quest.template.indexOf('challenge_anniversary2020_gift') >= 0:
			return `Send ${quest.target} Gift to a Friend.`;
		// NEW 2021-Quests
		case quest.template.indexOf('quest_gen2_jan21_grass') >= 0:
			return `Catch ${quest.target}Grass` + ` Type Pokémon.`;
		case quest.template.indexOf('jan_2021_catch_fire') >= 0:
			return `Catch ${quest.target}Fire` + ` Type Pokémon.`;
		case quest.template.indexOf('challenge_catch_easy') >= 0:
			return `Catch ${quest.target} Pokémon.`;
		// GYM BATTLING
		case quest.template.indexOf('gym_easy') >= 0:
		case quest.template.indexOf('gym_try') >= 0:
			return `Battle ${quest.target} Time(s) in a Gym.`;
		case quest.template.indexOf('gym_win') >= 0:
			return `Win ${quest.target} Gym Battle(s).`;

		// CATCH WITH PINAP
		case quest.template.indexOf('berry_pinap') >= 0:
			return `Catch ${quest.target} Pokémon With a Pinap Berry.`;

		// CATCH WITH NANAB
		case quest.template.indexOf('t2_2019_berry_nanab_pkmn') >= 0:
			return `Catch ${quest.target} Pokémon With a Nanab Berry.`;
		case quest.template.indexOf('t3_2019__berry_nanab_pkmn') >= 0:
			return `Use ${quest.target} Nanab berry to help catch Pokémon.`;

		// CATCH WITH RAZZ
		case quest.template.indexOf('berry_razz') >= 0:
			return `Catch ${quest.target} Pokémon With a Razz Berry.`;

		// CATCH WITH ANY BERRY
		case quest.template.indexOf('berry_easy') >= 0:
			return `Catch ${quest.target} Pokémon With a Razz Berry.`;
		case quest.template.indexOf('challenge_berry_moderate') >= 0:
			return `Catch ${quest.target} Pokémon With Any Berry.`;
		case quest.template.indexOf('challenge_anniversary2020_berry') >= 0:
			return `Use ${quest.target} berries to help catch Pokémon.`;
		// HATCH EGGS
		case quest.template.indexOf('hatch') >= 0:
			if (quest.target > 1) {
				return `Hatch ${quest.target} Eggs.`;
			}
			return `Hatch ${quest.target} Egg.`;

		// SPIN POKESTOPS
		case quest.template.indexOf('spin') >= 0:
			return `Spin ${quest.target} Pokéstops.`;

		// EVOLVE POKEMON
		case quest.template.indexOf('evolve_specific_plural') >= 0:
			let quest_pokemon = '';
			for (let p = 0; p < quest.conditions[0].info.pokemon_ids.length; p++) {
				quest_pokemon = `${masterfile.pokemon[quest.conditions[0].info.pokemon_ids[p]].name}, `;
			}
			quest_pokemon = quest_pokemon.slice(0, -2);
			return `Evolve a ${quest_pokemon}`;
		case quest.template.indexOf('evolve_item') >= 0:
			return `Evolve ${quest.target} Pokémon with an Evolution Item.`;
		case quest.template.indexOf('evolve') >= 0:
			return `Evolve ${quest.target} Pokémon.`;

		// BUDDY TASKS
		case quest.template.indexOf('buddy') >= 0:
			return `Get ${quest.target} Candy from Walking a Pokémon Buddy.`;
		case quest.template.indexOf('feed_treat') >= 0:
			return 'Give your buddy 3 treats';

		// POWER UP POKEMON
		case quest.template.indexOf('powerup') >= 0:
			return `Power Up ${quest.target} Pokémon.`;
		case quest.template.indexOf('challenge_mega_energy_power_up') >= 0:
			return 'Power Up a Pokémon 5 times.';

		// TRADE POKEMON
		case quest.template.indexOf('trade') >= 0:
			return `Perform ${quest.target} Trade(s) with a Friend.`;

		// TRANSFER POKEMON
		case quest.template.indexOf('transfer') >= 0:
			return `Transfer ${quest.target} Pokémon.`;

		// USE SPECIFIC CHARGE MOVES
		case quest.template.indexOf('charge') >= 0:
			if (quest.target > 1) {
				return `Use a Super Effective Charge Move ${quest.target} Times.`;
			}
			return `Use a Super Effective Charge Move ${quest.target} Times.`;

		// SNAPSHOTS
		case quest.template.indexOf('snapshot_easy') >= 0:
			if (quest.conditions[0].info && quest.conditions[0].info.pokemon_ids) {
				return `Take ${quest.target} Snapshots of ${masterfile.pokemon[quest.conditions[0].info.pokemon_ids[0]].name}`;
			}
		case quest.template.indexOf('quest_gen2_jan21_snapshot') >= 0:
			return `Take ${quest.target} ` + `Snapshots`;

		// PvP
		case quest.template.indexOf('pvp_participate_hard') >= 0:
			return `Win ${quest.target} PvP Battles`;
		case quest.template.indexOf('gbl_win') >= 0:
			return 'Win in the Go Battle League';
		case quest.template.indexOf('challenge_megasept2020_battle_energy') >= 0:
			return 'Battle another trainer';

		// PvE
		case quest.template.indexOf('pve_participate_medium') >= 0:
			return `Battle a team leader ${quest.target} times`;

		// TEAM ROCKET (HALLOWEEN 2019)
		case quest.template.indexOf('rocket') >= 0:
			return 'Defeat a Team GO Rocket Grunt';

		// GRUNT TYPE
		case quest.template.indexOf('grunt') >= 0:
			return `Battle against${quest.target}Team GO Rocket Grunt(s)`;
		case quest.template.indexOf('quest_tgr_feb21_grunt') >= 0:
			return `Battle against${quest.target}Team GO Rocket Grunt(s)`;
		case quest.template.indexOf('feb_2021_battle_gbl') >= 0:
			return `Complete ${quest.target}PVP Battles`;

		// feb 21
		case quest.template.indexOf('challenge_feb21_community_day') >= 0:
			return `Catch ${quest.target} Pokemon`;
		case quest.template.indexOf('quest_tgr_feb21_purify') >= 0:
			return `Purify ${quest.target} Pokemon`;

		// CATCH MISSING QUESTS
		default:
			console.error(`UPDATE FOR THIS QUEST (${quest.pokestop_id})`, quest);
			return 'UPDATE FOR THIS QUEST';
	}
}
