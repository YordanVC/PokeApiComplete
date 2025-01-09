import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, switchMap } from 'rxjs';
import { Pokemon, Species } from './models/pokemon';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';
  private apiSpeciesUrl = 'https://pokeapi.co/api/v2/pokemon-species';
  private apiEvolutionUrl = 'https://pokeapi.co/api/v2/evolution-chain';

  constructor(private http: HttpClient) { }

  // Obtener lista de pokemons
  getPokemons(offset: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?offset=${offset}&limit=20`);
  }

  // Obtener detalles de un pokemon
  getPokemonDetails(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.apiUrl}/${id}`);
  }

  // Obtener especie del pokemon (información adicional, como el 'about')
  getPokemonSpecies(id: number): Observable<Species> {
    return this.http.get<Species>(`${this.apiSpeciesUrl}/${id}`);
  }

  // Obtener detalles de evolución (cadena de evolución)
  getPokemonEvolution(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiEvolutionUrl}/${id}`);
  }

  // Llamada combinada para obtener todos los detalles de un Pokémon
  getPokemonFullDetails(id: number): Observable<any> {
    return this.getPokemonDetails(id).pipe(
      switchMap(details => {
        return this.getPokemonSpecies(details.species.url.split('/')[6]).pipe( // Aquí extraemos el id de la especie desde la URL
          switchMap(species => {
            return this.getPokemonEvolution(species.evolution_chain.url.split('/')[6]); // Usamos la URL de la cadena de evolución
          }),
          switchMap(evolution => {
            return forkJoin({
              details: this.getPokemonDetails(id),
              species: this.getPokemonSpecies(id),
              evolution: this.getPokemonEvolution(evolution.id)
            });
          })
        );
      })
    );
  }
}