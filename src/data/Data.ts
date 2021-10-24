import gruntTypes from './grunt-types.json';
import items from './items.json';
import moves from './moves.json';
import pokemonMoves from './pokemon-moves.json';
import pokemonTypes from './pokemon-types.json';
import forms from './pokemon-forms.json';
import pokemon from './pokemon.json';
import questCondtions from './quest-conditions.json';
import questRewardTypes from './quest-reward-types.json';
import questTypes from './quest-types.json';
import teams from './teams.json';
import throwTypes from './throw-types.json';
import weather from './weather.json';
import { Grunt, Item, Move, PokemonData, PokemonForm, PokemonTypeData, QuestGeneric, Team, Weather } from './DataTypes';

interface StringObject<T> {
	[key: string]: T;
}

const gruntTypesData = gruntTypes as StringObject<Grunt | undefined>;
const itemsData = items as StringObject<Item | undefined>;
const movesData = moves as StringObject<Move | undefined>;
const pokemonMovesData = pokemonMoves as StringObject<Move | undefined>;
const pokemonTypesData = pokemonTypes as StringObject<PokemonTypeData | undefined>;
const pokemonFormsData = forms as StringObject<PokemonForm | undefined>;
const pokemonData = pokemon as StringObject<PokemonData | undefined>;
const questCondtionsData = questCondtions as StringObject<QuestGeneric | undefined>;
const questRewardTypesData = questRewardTypes as StringObject<QuestGeneric | undefined>;
const questTypesData = questTypes as StringObject<string | undefined>;
const teamsData = teams as StringObject<Team | undefined>;

// Here we add the team data to also be mapped by name.
// This means the entries will reference the same object and the data
// won't be duplicated in runtime memory.
// But can be looked up by both id and name in the same data.
for (const key of Object.keys(teamsData)) {
	const currentTeam = teamsData[key];
	teamsData[currentTeam!.name.toLowerCase()] = currentTeam;
}

const throwTypesData = throwTypes as StringObject<string | undefined>;
const weatherData = weather as StringObject<Weather | undefined>;

export {
	gruntTypesData,
	itemsData,
	movesData,
	pokemonFormsData,
	pokemonMovesData,
	pokemonTypesData,
	pokemonData,
	questCondtionsData,
	questRewardTypesData,
	questTypesData,
	teamsData,
	throwTypesData,
	weatherData,
};
