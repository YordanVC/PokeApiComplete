export interface Pokemon {
    species: any;
    id: number;
    name: string;
    sprites: {
      front_default: string;
    };
    types: Type[];
    stats: Stat[];
    moves: Move[];
    abilities: Ability[];
  }
  export interface Ability {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }
  export interface Type {
    type: {
      name: string;
    };
  }
  
  export interface Stat {
    stat: {
      name: string;
    };
    base_stat: number;
  }
  
  export interface Move {
    move: {
      name: string;
    };
  }
  
  export interface Species {
    evolution_chain: any;
    flavor_text_entries: FlavorTextEntry[];
  }
  
  export interface FlavorTextEntry {
    language: {
      name: string;
    };
    flavor_text: string;
  }
  
  export interface EvolutionChain {
    species: {
      name: string;
    };
    evolves_to: EvolutionChain[];
  }
  