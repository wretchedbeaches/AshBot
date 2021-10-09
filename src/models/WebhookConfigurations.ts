import { GeofilterOption } from './WebhookFilters';

export interface RaidsetConfig {
	type: 'raid';
	ex?: boolean;
	name?: string;
	geofilter?: string | GeofilterOption;
	team?: 'uncontested' | 'mystic' | 'valor' | 'instinct';
	mincp?: number;
	maxcp?: number;
	minlevel?: number;
	maxlevel?: number;
	rmchannel?: boolean;
	train?: boolean;
	boosted?: boolean;
}

export interface QuestsetConfig {
	type: 'quest';
	geofilter?: string | GeofilterOption;
	rewardType?: string;
}

export interface InvasionsetConfig {
	type: 'invasions';
	geofilter?: string | GeofilterOption;
	leader?: boolean;
	train?: boolean;
}

export interface PokemonIV {
	attack: number;
	defense: number;
	stamina: number;
}

export interface PokesetConfig {
	type: 'pokemon';
	boosted?: boolean;
	name?: string | string[];
	// eslint-disable-next-line @typescript-eslint/ban-types
	geofilter?: string | Object;
	miniv?: number;
	maxiv?: number;
	mincp?: number;
	maxcp?: number;
	minlevel?: number;
	maxlevel?: number;
	rawiv?: PokemonIV;
	rmchannel?: boolean;
	train?: boolean;
}
