export default interface PokesetOptions {
	type: 'raid';
	ex?: boolean;
	name?: string;
	geofilter?: string;
	team?: 'uncontested' | 'mystic' | 'valor' | 'instinct';
	mincp?: number;
	maxcp?: number;
	minlevel?: number;
	maxlevel?: number;
	rmchannel?: boolean;
	train?: boolean;
}
