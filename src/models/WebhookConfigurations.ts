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
}

export interface QuestsetConfig {
	geofilter?: string | GeofilterOption;
	rewardType?: string;
}

export interface InvasionsetConfig {
	geofilter?: string | GeofilterOption;
	leader?: boolean;
	train?: boolean;
}
