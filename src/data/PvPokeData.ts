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
	stats?: BaseStats;
}

export interface GameMasterData {
	settings: Settings;
	rankingScenarios: RankingScenario[];
	cups: Cup[];
	pokemonTags: Tag[];
	pokemonTraits: PokemonTraits;
	pokemonRegions: PokemonRegion[];
	shadowPokemon: string[];
	pokemon: GameMasterPokemonData[];
	moves: Move[];
}

export interface Cup {
	name: string;
	title: string;
	include: Include[];
	exclude: Exclude[];
	partySize?: number;
	link?: string;
	restrictedPicks?: number;
	restrictedPokemon?: string[];
	tierRules?: TierRules;
	levelCap?: number;
	slots?: Slot[];
	overrides?: any[];
	league?: number;
	presetOnly?: boolean;
}

export interface Exclude {
	filterType: FilterType;
	values: string[];
	name?: string;
	leagues?: number[];
}

export enum FilterType {
	Dex = 'dex',
	ID = 'id',
	Tag = 'tag',
	Type = 'type',
}

export interface Include {
	filterType: FilterType;
	values: Array<number | string>;
	name?: string;
	includeShadows?: number;
}

export interface Slot {
	pokemon: string[];
}

export interface TierRules {
	max: number;
	floor: number;
	tiers: Tier[];
}

export interface Tier {
	points: number;
	pokemon: string[];
}

export interface Move {
	moveId: string;
	name: string;
	abbreviation?: string;
	type: Type;
	power: number;
	energy: number;
	energyGain: number;
	cooldown: number;
	archetype?: string;
	buffs?: number[];
	buffTarget?: BuffTarget;
	buffApplyChance?: string;
}

export enum BuffTarget {
	Opponent = 'opponent',
	Self = 'self',
}

export enum Type {
	Bug = 'bug',
	Dark = 'dark',
	Dragon = 'dragon',
	Electric = 'electric',
	Fairy = 'fairy',
	Fighting = 'fighting',
	Fire = 'fire',
	Flying = 'flying',
	Ghost = 'ghost',
	Grass = 'grass',
	Ground = 'ground',
	Ice = 'ice',
	None = 'none',
	Normal = 'normal',
	Poison = 'poison',
	Psychic = 'psychic',
	Rock = 'rock',
	Steel = 'steel',
	Water = 'water',
}

export interface GameMasterPokemonData {
	dex: number;
	speciesName: string;
	speciesId: string;
	baseStats: BaseStats;
	types: Type[];
	fastMoves: string[];
	chargedMoves: string[];
	tags?: Tag[];
	defaultIVs: { [key: string]: number[] };
	level25CP?: number;
	buddyDistance?: number;
	thirdMoveCost?: boolean | number;
	released?: boolean;
	eliteMoves?: string[];
	searchPriority?: number;
	legacyMoves?: string[];
	levelCap?: number;
	levelFloor?: number;
}

export interface BaseStats {
	atk: number;
	def: number;
	hp: number;
}

export enum Tag {
	Alolan = 'alolan',
	Galarian = 'galarian',
	Include1500 = 'include1500',
	Legendary = 'legendary',
	Mega = 'mega',
	Mythical = 'mythical',
	Regional = 'regional',
	Shadow = 'shadow',
	Shadoweligible = 'shadoweligible',
	Starter = 'starter',
	Teambuilderexclude = 'teambuilderexclude',
	Untradeable = 'untradeable',
	Xs = 'xs',
}

export interface PokemonRegion {
	string: string;
	name: string;
	dexStart: number;
	dexEnd: number;
}

export interface PokemonTraits {
	pros: string[];
	cons: string[];
}

export interface RankingScenario {
	slug: string;
	shields: number[];
	energy: number[];
}

export interface Settings {
	partySize: number;
	maxBuffStages: number;
	buffDivisor: number;
	shadowAtkMult: number;
	shadowDefMult: number;
}
