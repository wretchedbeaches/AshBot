export default interface PokesetOptions {
  type: 'pokemon';
  boosted?: boolean;
  name?: string;
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
