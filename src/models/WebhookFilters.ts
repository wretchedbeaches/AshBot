export interface WebhookFilter {
  type: 'invasion' | 'pokemon' | 'quest' | 'raid';
  geofilter?: {
    city?: string;
    center?: number[];
    radius?: number;
    unit?: 'km' | 'm';
  };
  rmchannel?: boolean;
}

export interface PokemonWebhookFilter extends WebhookFilter {
  type: 'pokemon';
  boosted?: boolean;
  shiny?: boolean;
  pokemon_id?: number;
  miniv?: number;
  maxiv?: number;
  mincp?: number;
  maxcp?: number;
  minlevel?: number;
  maxlevel?: number;
  rawiv?: {
    attack: number;
    defense: number;
    stamina: number;
  };
}

export interface RaidWebhookFilter extends WebhookFilter {
  type: 'raid';
  ex_eligible?: boolean;
  boosted?: boolean;
  train?: boolean;
  pokemon_id?: number;
  team?: 'uncontested' | 'mystic' | 'valor' | 'instinct';
  mincp?: number;
  maxcp?: number;
  tier?: number;
}

export interface InvasionWebhookFilter extends WebhookFilter {
  type: 'invasion';
  leader?: boolean;
  train?: boolean;
}

export interface QuestWebhookFilter extends WebhookFilter {
  type: 'quest';
  reward?: 'item' | 'stardust' | 'pokemon';
}
