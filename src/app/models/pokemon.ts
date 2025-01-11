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
}
export interface PokemonSpecies {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[]; // Descripción del Pokémon
  evolution_chain: { url: string }; // URL de la cadena de evolución
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
