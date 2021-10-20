// THIS IS A VERY WORK IN PROGRESS< TYPES MAY BE INCOMPLETE OR INCORRECT
// THESE ARE ONLY USED IN PLACES WHERE THE USAGE AND THE TYPE IS GUARANTEED
// TO BE 100% ALIGNED.

interface StringObject<T> {
	[key: string]: T;
}

export interface TeamData {
	id: number;
	name: string;
	color: number;
}

export interface TeamsData {
	[key: number]: TeamData;
}

// TODO: Update items structure to be keyed by name and have the id as a number
export interface PokemonItemDataType {
	id?: string;
	name: string;
	proto: string;
	type: string;
	category: string;
	min_trainer_level: number;
}

export interface PokemonEvolutionDataType {
	pokemon: number;
	form: number;
	candyCost: number;
}

export interface PokemonFormDataType {
	name: string;
	proto: string;
	form: number;
	evolutions?: { [key: string]: PokemonEvolutionDataType };
	tempEvolutions?: StringObject<{ tempEvoId: number | string }>;
	isCostume?: boolean;
}

export interface UtilsTypeDataType {
	id: number;
	emoji: string;
	color: number;
}

export interface UtilsTypesDataType {
	[key: string]: UtilsTypeDataType;
}

export interface PokemonTypeDataType {
	typeId: number;
	typeName: string;
}

export interface PokemonStatsDataType {
	attack: number;
	defense: number;
	stamina: number;
}

export interface PokemonMoveDataType {
	moveId: number;
	moveName: string;
	proto: string;
	type: number;
	power: number;
}

export interface PokemonEncounterDataType {
	fleeRate: number;
	captureRate: number;
	bonusCandyCapture?: number;
	bonusStardustCapture?: number;
}

export interface PokemonMiscDataType {
	buddyGroupNumber: number;
	buddyDistance: number;
	buddyMegaEnergy: number;
	thirdMoveStardust: number;
	thirdMoveCandy: number;
	gymDefenderEligible: boolean;
	tradable: boolean;
	transferable: boolean;
}

export interface PokemonDataType {
	name: string;
	pokedexId: number;
	defaultFormId: number;
	genId: number;
	generation: string;
	forms: StringObject<PokemonFormDataType>;
	types: StringObject<PokemonTypeDataType>;
	height: number;
	weight: number;
	quickMoves: StringObject<PokemonMoveDataType>;
	chargedMoves: StringObject<PokemonMoveDataType>;
	family: number;
	encounter: PokemonEncounterDataType;
	legendary: boolean;
	mythic: boolean;
	misc: PokemonMiscDataType;
	evolutions?: StringObject<PokemonEvolutionDataType>;
	little: boolean;
}

export interface RankingMatchupDataType {
	opponent: string;
	rating: number;
}

export interface RankingMoveDataType {
	moveId: string;
	uses: number;
}
export interface RankingMovesDataType {
	fastMoves: RankingMoveDataType[];
	chargedMoves: RankingMoveDataType[];
}
export interface RankingDataType {
	speciesId: string;
	speciesName: string;
	rating: number;
	matchups: RankingMatchupDataType[];
	counters: RankingMatchupDataType[];
	moves: RankingMovesDataType;
	moveset: string[];
	score: number;
	scores: number[];
}

export interface WeatherApiDataCoordType {
	lat: number;
	lon: number;
}

export interface WeatherApiDataWeatherType {
	id: number;
	main: string;
	description: string;
	icon: string;
}

export interface WeatherApiDataMainType {
	temp: number;
	feels_like: number;
	temp_min: number;
	temp_max: number;
	pressure: number;
	humidity: number;
}

export interface WeatherApiDataWindType {
	speed: number;
	deg: number;
	gust?: number;
}

export interface WeatherApiDataCloudType {
	all: number;
}

export interface WeatherApiDataSysType {
	type: number;
	id: number;
	country: string;
	sunrise: number;
	sunset: number;
}
export interface WeatherApiDataType {
	coord: WeatherApiDataCoordType;
	weather: WeatherApiDataWeatherType[];
	base: string;
	main: WeatherApiDataMainType;
	visibility: number;
	wind: WeatherApiDataWindType;
	clouds: WeatherApiDataCloudType;
	dt: number;
	sys: WeatherApiDataSysType;
	timezone: number;
	id: number;
	name: string;
	cod: number;
}

export interface WeatherApiDataErrorType {
	cod: string;
	message: string;
}
