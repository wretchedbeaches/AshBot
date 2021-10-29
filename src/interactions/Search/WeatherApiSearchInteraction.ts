import COMMAND_NAMES from '../../util/CommandNames';
import { latitudeLongitudeCitySearchOptions } from '../Base/CommonOptions';

export default {
	name: COMMAND_NAMES.SEARCH.WEATHER_API,
	description: 'Search for the weather at a particular location using the Open Weather Map API.',
	options: [...latitudeLongitudeCitySearchOptions],
	default_permission: true,
} as const;
