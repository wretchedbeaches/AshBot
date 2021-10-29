import { latitudeLongitudeCitySearchOptions } from '../Base/CommonOptions';

export default {
	name: 'weather2',
	description: 'Search for the weather at a particular location using the Open Weather Map API.',
	options: [...latitudeLongitudeCitySearchOptions],
	default_permission: true,
} as const;
