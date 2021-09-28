import { getPreciseDistance } from 'geolib';
import inside from 'point-in-polygon';
import BotClient from '../client/BotClient';
import config from '../config.json';
import util from '../util/util.json';

export const isInvalid = (value: any): boolean => {
	return value === undefined || value === null;
};

export const isValid = (value: any): boolean => {
	return !isInvalid(value);
};

export const isNonEmptyArray = (value: any): boolean => {
	return Array.isArray(value) && value.length > 0;
};

const isZero = (value: any): boolean => {
	return value === 0;
};

const greaterThanOrEqualTo = (a: number, b: number): boolean => {
	return a >= b;
};

const lessThanOrEqualTo = (a: number, b: number): boolean => {
	return a <= b;
};

export const filterBoosted = (channelConfig, isBoosted?: boolean) => {
	const { IsBoosted: configIsBoosted } = channelConfig;
	if (isInvalid(configIsBoosted) || isInvalid(isBoosted)) {
		return true;
	}
	return configIsBoosted === isBoosted;
};

const filterMin = (val: number, min?: number) => {
	return isInvalid(min) || greaterThanOrEqualTo(val, min!);
};

const filterMax = (val: number, max?: number) => {
	return isInvalid(max) || lessThanOrEqualTo(val, max!);
};

const filterNumber = (val?: number | null, min?: number, max?: number): boolean => {
	if (isInvalid(val) || isZero(val)) return true;
	return filterMin(val!, min) && filterMax(val!, max);
};

export const filterCP = (channelConfig, cp?: number | null) => {
	return filterNumber(cp, channelConfig.mincp, channelConfig.maxcp);
};

export const filterLevel = (channelConfig, level?: number | null) => {
	return filterNumber(level, channelConfig.minlevel, channelConfig.maxlevel);
};

export const filterIV = (channelConfig, iv?: number) => {
	return filterNumber(iv, channelConfig.miniv, channelConfig.maxiv);
};

export const filterRawIV = (channelConfig, ivs): boolean => {
	const { rawiv: configiv } = channelConfig;
	if (isInvalid(configiv)) return true;
	return (
		ivs.individual_attack === configiv.attack &&
		ivs.individual_defense === configiv.defense &&
		ivs.individual_stamina === configiv.stamina
	);
};

export const filterName = (channelConfig, name) => {
	const { name: configName } = channelConfig;
	if (isInvalid(configName)) return true;
	return configName.includes(name.toLowerCase());
};

export const filterLongLat = (latitude, longitude) => {
	return isInvalid(latitude) || isInvalid(longitude);
};

export const filterGeo = (channelConfig, location) => {
	if (isInvalid(channelConfig.geofilter)) return true;
	const {
		radius,
		geofilter: { center },
	} = channelConfig;
	const { longitude, latitude } = location;
	if (
		!isInvalid(radius) &&
		getPreciseDistance(location, {
			latitude: center[0],
			longitude: center[1],
		}) < radius
	) {
		return true;
	}

	return inside([latitude, longitude], config.cities[channelConfig.geofilter!]);
};

export const filterTrain = (client: BotClient, channelId, channelConfig, location) => {
	if (typeof channelConfig.train === 'boolean' && channelConfig.train) {
		if (!client.trains.has(channelId)) return true;
		const trains = client.trains.get(channelId)!;
		return (
			getPreciseDistance(location, {
				latitude: trains.latitude,
				longitude: trains.longitude,
			}) < parseInt(process.env.TRAIN_DISTANCE!, 10)
		);
	}
	return true;
};

export const filterShiny = (channelConfig, username, shiny) => {
	if (typeof channelConfig.shiny === 'boolean' && channelConfig.shiny) {
		return shiny && config.shinyMentions[username] && config.shinyMentions[username].length === 21;
	}
	return true;
};

export const filterExRaid = (channelConfig, isEligible) => {
	if (isInvalid(channelConfig.ex)) return true;
	return channelConfig.ex === isEligible;
};

export const filterTeam = (channelConfig, teamId?: number) => {
	if (isInvalid(channelConfig) || isInvalid(teamId)) return true;
	return util.teams[`${teamId!}`]?.name.toLowerCase() === channelConfig.team;
};
