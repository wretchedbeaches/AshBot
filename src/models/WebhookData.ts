export type EventType = 'pokemon' | 'raid' | 'quest' | 'invasion';

export interface PokemonRanking {
	pokemon: number;
	rank?: number;
	cp?: number;
	level?: number;
	percentage?: number;
}

export interface PokemonEventData {
	cp?: number | null;
	pokemon_level?: number | null;
	individual_attack?: number | null;
	individual_defense?: number | null;
	individual_stamina?: number | null;
	pokemon_id?: number | null;
	latitude?: number | null;
	longitude?: number | null;
	weather?: number | null;
	shiny?: boolean | null;
	username: string;
	capture_1?: number | null;
	capture_2?: number | null;
	capture_3?: number | null;
	move_1?: number | null;
	move_2?: number | null;
	pokestop_id?: string | null;
	spawnpoint_id: string | null;
	gender?: number | null;
	is_event?: boolean | null;
	disappear_time?: number | null;
	pvp_rankings_great_league?: PokemonRanking[] | null;
	pvp_rankings_ultra_league?: PokemonRanking[] | null;
	iv?: number | null;
	pokestop?: any | null;
}

export interface RaidEventData {
	gym_name?: string;
	latitude?: number;
	longitude?: number;
	gender?: number;
	gym_url?: string;
	level?: number;
	end: number;
	cp?: number;
	pokemon_id?: number;
	team_id?: number;
	move_1?: number;
	move_2?: number;
	ex_raid_eligible?: boolean;
}

export interface QuestEventRewardInfo {
	item_id?: number;
	amount?: number;
	pokemon_id?: number;
}
export interface QuestEventRewards {
	type: number;
	info: QuestEventRewardInfo;
}

export interface PokemonConditionInfo {
	pokemon_ids?: number[];
	pokemon_type_ids?: number[];
	hit?: boolean;
	throw_type_id?: number;
	raid_levels?: any;
}

export interface PokemonCondition {
	type?: number;
	info: PokemonConditionInfo;
}

export interface QuestEventData {
	pokestop_id?: string;
	latitude?: number;
	longitude?: number;
	type?: number;
	target?: number;
	gender?: number;
	pokestop_name?: string;
	rewards?: QuestEventRewards[];
	updated?: number;
	template?: string;
	ar_scan_eligible?: boolean;
	conditions: PokemonCondition[];
}

export interface InvasionEventData {
	latitude?: number;
	longitude?: number;
	grunt_type: number;
	name?: string;
	url?: string;
	incident_expire_timestamp?: number;
}

export interface HookEvent {
	type: EventType;
	message: PokemonEventData | RaidEventData | QuestEventData | InvasionEventData;
}
