// THIS IS A VERY WORK IN PROGRESS< TYPES MAY BE INCOMPLETE OR INCORRECT
// THESE ARE ONLY USED IN PLACES WHERE THE USAGE AND THE TYPE IS GUARANTEED
// TO BE 100% ALIGNED.

interface StringObject<T> {
	[key: string]: T;
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
