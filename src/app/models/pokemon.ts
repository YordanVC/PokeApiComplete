export interface Pokemon {
  id: number; // Identificador único del Pokémon
  name: string; // Nombre del Pokémon
  sprites: {
    front_default: string; // Imagen frontal por defecto
  };
  types: { type: { name: string } }[]; // Tipos del Pokémon
  abilities: { ability: { name: string } }[]; // Habilidades
  stats: { base_stat: number; stat: { name: string } }[]; // Estadísticas básicas
  moves: { move: { name: string } }[]; // Movimientos
  evolutionChain?: string[];
  megaEvolutions?: string[];
}
export interface PokemonSpecies {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[]; // Descripción del Pokémon
  evolution_chain: { url: string }; // URL de la cadena de evolución
}
// Nueva interfaz para las variedades
export interface PokemonVariety {
  is_default: boolean;
  pokemon: {
    name: string;
    url: string;
  };
}

export interface PokemonEvolution {
  chain: {
    evolves_to: {
      species: { name: string };
      evolves_to: any[]; // Estructura recursiva
    }[];
    species: { name: string };
  };
}

// Nueva interfaz para los detalles de evolución
export interface EvolutionDetail {
  name: string;
  sprite: string;
  isMega?: boolean;
}

export interface MyPokemonsResponse {
  id: number;
  pokemonId: number;
  username: string;
  estado: 'CAPTURADO' | 'LIBERADO';
}
export interface PokemonRequest {
  username: string;
  pokemonId: number;
}