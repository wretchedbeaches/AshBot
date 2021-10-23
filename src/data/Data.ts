import * as gruntTypes from './grunt-types.json';
import * as items from './items.json';
import * as moves from './moves.json';
import * as pokemonMoves from './pokemon-moves.json';
import * as pokemonTypes from './pokemon-types.json';
import * as forms from './pokemon-forms.json';
import * as pokemon from './pokemon.json';
import * as questCondtions from './quest-conditions.json';
import * as questRewardTypes from './quest-reward-types.json';
import * as questTypes from './quest-types.json';
import * as teams from './teams.json';
import * as throwTypes from './throw-types.json';
import * as weather from './weather.json';
import {
	Grunt,
	Item,
	Move,
	PokemonData,
	PokemonForm,
	PokemonTypeData,
	QuestGeneric,
	TeamsData,
	Weather,
} from './DataTypes';
import { StringObject } from '../models/Data';

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
const teamsData = teams as TeamsData;
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
