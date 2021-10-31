import type { HexColorString } from 'discord.js';

type Coordinate = [number, number];
export type City = Coordinate[];

// WEATHER

export interface Weather {
	id: number;
	name: string;
	emojiBackup: string;
	emoji?: string;
	boosted: TypeElement[];
}

export interface WeatherApiDataCoord {
	lat: number;
	lon: number;
}

export interface WeatherApiDataWeather {
	id: number;
	main: string;
	description: string;
	icon: string;
}

export interface WeatherApiDataMain {
	temp: number;
	feels_like: number;
	temp_min: number;
	temp_max: number;
	pressure: number;
	humidity: number;
}

export interface WeatherApiDataWind {
	speed: number;
	deg: number;
	gust?: number;
}

export interface WeatherApiDataCloud {
	all: number;
}

export interface WeatherApiDataSys {
	type: number;
	id: number;
	country: string;
	sunrise: number;
	sunset: number;
}
export interface WeatherApiData {
	coord: WeatherApiDataCoord;
	weather: WeatherApiDataWeather[];
	base: string;
	main: WeatherApiDataMain;
	visibility: number;
	wind: WeatherApiDataWind;
	clouds: WeatherApiDataCloud;
	dt: number;
	sys: WeatherApiDataSys;
	timezone: number;
	id: number;
	name: string;
	cod: number;
}

export interface WeatherApiDataError {
	cod: string;
	message: string;
}

// GRUNT

export interface Grunt {
	type: string;
	gender: number;
	grunt?: string;
	second_reward: boolean;
	encounters: Encounters;
	image?: string;
}

export interface Encounters {
	first?: number[];
	second?: number[];
	third?: number[];
}

// ITEM

export interface Item {
	id: number;
	name: string;
	proto: string;
	type: string;
	category: string;
	min_trainer_level?: number;
}

// QUEST

export interface QuestGeneric {
	prototext: string;
	text: string;
}

export interface Team {
	id: number;
	name: string;
	color: number;
	emoji: string;
}

export interface RankingMatchupData {
	opponent: string;
	rating: number;
}

export interface RankingMoveData {
	moveId: string;
	uses: number;
}
export interface RankingMovesData {
	fastMoves: RankingMoveData[];
	chargedMoves: RankingMoveData[];
}
export interface RankingData {
	speciesId: string;
	speciesName: string;
	rating: number;
	matchups: RankingMatchupData[];
	counters: RankingMatchupData[];
	moves: RankingMovesData;
	moveset: string[];
	score: number;
	scores: number[];
}

// POKEMON DATA TYPES

export interface PokemonTypeData {
	id: number;
	name: string;
	emoji: string;
	color: HexColorString;
	emojiBackup: string;
	immunes: TypeElement[];
	weaknesses: TypeElement[];
	resistances: TypeElement[];
	strengths: TypeElement[];
}

export interface PokemonData {
	name: string;
	pokedexId: number;
	defaultFormId: number;
	genId: number;
	generation: string;
	forms: number[];
	types: TypeElement[];
	stats: Stats;
	height?: number;
	weight?: number;
	quickMoves?: number[];
	chargedMoves?: number[];
	family?: number;
	encounter?: Encounter;
	legendary?: boolean;
	mythic?: boolean;
	misc?: Misc;
	evolutions?: { [key: string]: Evolution };
	little?: boolean;
	tempEvolutions?: TempEvolutions;
	unreleased?: boolean;
}

export interface Encounter {
	fleeRate?: number;
	captureRate?: number;
	bonusCandyCapture?: number;
	bonusStardustCapture?: number;
}

export interface Evolution {
	pokemon: number;
	form: number;
	candyCost?: number;
	questRequirement?: QuestRequirement;
	itemRequirement?: string;
	genderRequirement?: number;
	tradeBonus?: boolean;
	onlyDaytime?: boolean;
	onlyNighttime?: boolean;
	mustBeBuddy?: boolean;
}

export interface QuestRequirement {
	questType: number;
	target: number;
	assetsRef: string;
	i18n: string;
	translated: string;
}

export type Generation = 'Alola' | 'Galar' | 'Hoenn' | 'Johto' | 'Kalos' | 'Kanto' | 'Sinnoh' | 'Unova';

export interface Misc {
	buddyGroupNumber?: number;
	buddyDistance: number;
	buddyMegaEnergy?: number;
	thirdMoveStardust?: number;
	thirdMoveCandy: number;
	gymDefenderEligible?: boolean;
	tradable?: boolean;
	transferable?: boolean;
}

export interface Stats {
	attack: number;
	defense: number;
	stamina: number;
}

export interface TempEvolutions {
	'1'?: The1;
	Gmax?: AmpedGmax;
	'2'?: The2;
	'3'?: The1;
	Primal?: AmpedGmax;
	'Low Key Gmax'?: AmpedGmax;
	'Amped Gmax'?: AmpedGmax;
	'Single Strike Gmax'?: AmpedGmax;
	'Rapid Strike Gmax'?: AmpedGmax;
}

export interface The1 {
	tempEvoId: number;
	stats: Stats;
	height?: number;
	weight?: number;
	firstEnergyCost?: number;
	subsequentEnergyCost?: number;
	unreleased?: boolean;
	types?: { [key: string]: TypeValue };
}

export interface TypeValue {
	typeId: number;
	typeName: TypeElement;
}

export type TypeElement =
	| 'Bug'
	| 'Dark'
	| 'Dragon'
	| 'Electric'
	| 'Fairy'
	| 'Fighting'
	| 'Fire'
	| 'Flying'
	| 'Ghost'
	| 'Grass'
	| 'Ground'
	| 'Ice'
	| 'Normal'
	| 'Poison'
	| 'Psychic'
	| 'Rock'
	| 'Steel'
	| 'Water';

export interface The2 {
	tempEvoId: number;
	stats: Stats;
	weight?: number;
	types: { [key: string]: TypeValue };
	firstEnergyCost?: number;
	subsequentEnergyCost?: number;
	unreleased?: boolean;
}

export interface AmpedGmax {
	tempEvoId: string;
	stats: Stats;
	unreleased: boolean;
	types?: { [key: string]: TypeValue };
}

export interface Move {
	id: number;
	name: string;
	proto: string;
	type?: string;
	power?: number;
}

export interface PokemonForm {
	formName: string;
	proto: string;
	id: number;
	chargedMoves?: number[];
	quickMoves?: number[];
	types?: number[];
	attack?: number;
	defense?: number;
	stamina?: number;
	evolutions?: FormEvolution[];
	purificationDust?: number;
	purificationCandy?: number;
	height?: number;
	weight?: number;
	tempEvolutions?: TempEvolution[];
	isCostume?: boolean;
	little?: boolean;
}

export interface FormEvolution {
	evoId: number;
	id: number;
	candyCost: number;
	tradeBonus?: boolean;
	genderRequirement?: number;
	itemRequirement?: number;
	questRequirement?: string;
}

export type TempEvoIDEnum = 'Gmax' | 'Primal';

export interface TempEvolution {
	tempEvoId: TempEvoIDEnum | number;
	attack: number;
	defense: number;
	stamina: number;
	unreleased?: boolean;
	types?: number[];
	height?: number;
	weight?: number;
	firstEnergyCost?: number;
	subsequentEnergyCost?: number;
}
