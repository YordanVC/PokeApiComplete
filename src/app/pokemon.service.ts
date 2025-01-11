import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { Pokemon, PokemonEvolution } from './models/pokemon';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';
  private apiEvolutionUrl = 'https://pokeapi.co/api/v2/evolution-chain';
  private maxPokemons = 1025; // Número máximo de pokémons disponibles

  constructor(private http: HttpClient) { }

  // Obtener lista de pokémons
  getPokemons(offset: number): Observable<{ total: number; pokemons: any[] }> {
    const limit = 20;

    // Validar que el offset no supere el número máximo
    if (offset >= this.maxPokemons) {
      offset = this.maxPokemons - limit;
    }

    return this.http.get<any>(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=20`).pipe(
      switchMap((response: any) => {
        const pokemonRequests = response.results.map((pokemon: any) =>
          this.http.get<any>(pokemon.url) // Solicita los detalles de cada Pokémon
        );
        return forkJoin<any[]>(pokemonRequests); // Ejecuta solicitudes simultaneas
      }),
      map((pokemons: any[]) => ({
        total: this.maxPokemons,
        pokemons: pokemons.map((pokemon) => ({
          id: pokemon.id,
          name: pokemon.name,
          sprites: pokemon.sprites,
          types: pokemon.types,
          abilities: pokemon.abilities,
          stats: pokemon.stats,
          moves: pokemon.moves,
        }))
      }))
    );
  }

  // Obtener detalles básicos de un Pokémon por nombre o ID
  getPokemonByNameOrId(query: string): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.apiUrl}/${query.toLowerCase()}`);
  }
  // Método para obtener los detalles de la especie del Pokémon
  getPokemonSpecies(pokemonId: string): Observable<any> {
    return this.http.get<any>(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
  }

  // Obtener detalles enriquecidos combinados (incluye evolución)
  getPokemonFullDetails(query: string): Observable<Pokemon & { evolutionChain: string[] }> {
    return this.getPokemonByNameOrId(query).pipe(
      switchMap((pokemon) => {
        // Primero obtener los detalles de la especie
        return this.getPokemonSpecies(pokemon.id.toString()).pipe(
          map(species => ({ pokemon, species }))
        );
      }),
      switchMap(({ pokemon, species }) => {
        // Obtener el ID de la cadena de evolución desde la especie
        const evolutionChainUrl = species.evolution_chain.url;
        
        // Obtener la cadena de evolución usando la URL
        return this.http.get<PokemonEvolution>(evolutionChainUrl).pipe(
          map(evolutionChain => ({
            pokemon,
            evolutionChain
          }))
        );
      }),
      map((data) => ({
        ...data.pokemon,
        image: data.pokemon.sprites.front_default,
        types: data.pokemon.types.map((t) => ({ type: { name: t.type.name } })),
        stats: data.pokemon.stats.map((s) => ({
          base_stat: s.base_stat,
          stat: { name: s.stat.name },
        })),
        moves: data.pokemon.moves.map((m) => ({ move: { name: m.move.name } })),
        evolutionChain: this.getEvolutionChain(data.evolutionChain.chain), // Pasar la cadena de evolución completa
      }))
    );
  }
  
  // Método para obtener cadena de evolución más robusto
  getEvolutionChain(chain: PokemonEvolution['chain']): string[] {
    const evolutions: string[] = [];
    
    const processChain = (evoChain: PokemonEvolution['chain']) => {
      // Añadir la especie actual
      if (evoChain.species) {
        evolutions.push(evoChain.species.name);
      }
      
      // Procesar las evoluciones siguientes
      if (evoChain.evolves_to && evoChain.evolves_to.length > 0) {
        evoChain.evolves_to.forEach((evolution) => {
          processChain(evolution);
        });
      }
    };
    
    processChain(chain);
    return evolutions;
  }

  getEvolutionDetails(evolutionChain: string[]): Observable<{ name: string, sprite: string }[]> {
    const evolutionRequests = evolutionChain.map(name => 
      this.getPokemonByNameOrId(name).pipe(
        map(pokemon => ({
          name: pokemon.name,
          sprite: pokemon.sprites.front_default
        }))
      )
    );
  
    // Combinar los resultados de todas las solicitudes
    return forkJoin(evolutionRequests);
  }

}