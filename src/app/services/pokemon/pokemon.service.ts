import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';
import { MyPokemonsResponse, Pokemon, PokemonEvolution, PokemonRequest } from '../../models/pokemon';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';
  private apiSpeciesUrl = 'https://pokeapi.co/api/v2/pokemon-species';
  private apiBackendPokemon = 'http://localhost:8080/pokedex/user-pokemons';
  private maxPokemons = 1025; // Número máximo de pokémons

  constructor(private http: HttpClient
    , private authService: AuthService
  ) { }

  // Obtener lista de pokemons
  getPokemons(offset: number): Observable<{ total: number; pokemons: any[] }> {
    const limit = 20;

    // Validar que el offset no supere el número máximo
    if (offset >= this.maxPokemons) {
      offset = this.maxPokemons - limit;
    }

    return this.http.get<any>(`${this.apiUrl}?offset=${offset}&limit=20`).pipe(
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
    return this.http.get<any>(`${this.apiSpeciesUrl}/${pokemonId}`);
  }

  //q
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
        return forkJoin({
          evolutionData: this.http.get<PokemonEvolution>(evolutionChainUrl),
          varieties: of(species.varieties)
        }).pipe(
          map(({ evolutionData, varieties }) => ({
            pokemon,
            evolutionChain: evolutionData,
            varieties
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
        evolutionChain: this.getEvolutionChain(data.evolutionChain.chain),
        megaEvolutions: this.getMegaEvolutions(data.varieties)
      }))
    );
  }
  private getMegaEvolutions(varieties: any[]): string[] {
    return varieties
      .filter(variety => variety.pokemon.name.includes('-mega'))
      .map(variety => variety.pokemon.name);
  }

  getEvolutionDetails(evolutionChain: string[], megaEvolutions: string[] = []): Observable<{ name: string, sprite: string }[]> {
    const allForms = [...evolutionChain, ...megaEvolutions];

    const evolutionRequests = allForms.map(name =>
      this.getPokemonByNameOrId(name).pipe(
        map(pokemon => ({
          name: pokemon.name,
          sprite: pokemon.sprites.front_default
        }))
      )
    );

    return forkJoin(evolutionRequests);
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

  // Obtener los Pokémon del usuario actual
  getUserPokemons(): Observable<MyPokemonsResponse[]> {
    const username = this.authService.getCurrentUsername();
    
    if (!username) {
        return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}` // Asegúrate de que el token tenga el prefijo "Bearer "
    });

    return this.http.get<MyPokemonsResponse[]>(`${this.apiBackendPokemon}/${username}`, { headers })
        .pipe(
            catchError(error => {
                console.error('Error detallado:', error);
                
                if (error.status === 401) {
                    // Manejar específicamente el error 401
                    
                }
                
                return throwError(() => error);
            })
        );
}

  // Agregar un Pokémon
  addPokemon(pokemonId: number): Observable<string> {
    const username = this.authService.getCurrentUsername();

    if (!username) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const request: PokemonRequest = {
      username,
      pokemonId
    };
    return this.http.post<string>(`${this.apiBackendPokemon}/add`, { body: request });
  }

  // Liberar un Pokémon
  removePokemon(pokemonId: number): Observable<string> {
    const username = this.authService.getCurrentUsername();
    if (!username) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    const request: PokemonRequest = {
      username,
      pokemonId
    };
    return this.http.delete<string>(`${this.apiBackendPokemon}/remove`, { body: request });
  }


}