import { GeofilterOption } from './WebhookFilters';

export default interface RaidetOptions {
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
