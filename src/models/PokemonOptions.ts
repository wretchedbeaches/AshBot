export default interface PokesetOptions {
	type: 'pokemon';
	boosted?: boolean;
	name?: string;
	// eslint-disable-next-line @typescript-eslint/ban-types
	geofilter?: string | Object;
	miniv?: number;
	maxiv?: number;
	mincp?: number;
	maxcp?: number;
	minlevel?: number;
	maxlevel?: number;
	rawiv?: string;
	rmchannel?: boolean;
	train?: boolean;
}
