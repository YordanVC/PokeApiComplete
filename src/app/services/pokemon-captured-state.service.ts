import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MyPokemonsResponse } from '../models/pokemon';

@Injectable({
  providedIn: 'root'
})
export class PokemonCapturedStateService {
  private capturedPokemonsSource = new BehaviorSubject<number>(0);
  private capturedPokemonsListSource = new BehaviorSubject<MyPokemonsResponse[]>([]);

  capturedPokemons$ = this.capturedPokemonsSource.asObservable();
  capturedPokemonsList$ = this.capturedPokemonsListSource.asObservable();

  setCapturedPokemons(count: number) {
    this.capturedPokemonsSource.next(count);
  }

  setCapturedPokemonsList(pokemons: MyPokemonsResponse[]) {
    this.capturedPokemonsListSource.next(pokemons);
    this.capturedPokemonsSource.next(pokemons.length);
  }
  addCapturedPokemon(pokemon: MyPokemonsResponse) {
    const currentList = this.capturedPokemonsListSource.value;
    
    // Verificar si el Pokémon ya existe para evitar duplicados
    const pokemonExists = currentList.some(p => p.pokemonId === pokemon.pokemonId);
    
    if (!pokemonExists) {
      const updatedList = [...currentList, pokemon];
      this.capturedPokemonsListSource.next(updatedList);
      this.capturedPokemonsSource.next(updatedList.length);
    }
  }

  incrementCapturedPokemons() {
    const currentCount = this.capturedPokemonsSource.value;
    this.capturedPokemonsSource.next(Math.max(currentCount + 1, 0));
  }

  decrementCapturedPokemons() {
    const currentCount = this.capturedPokemonsSource.value;
    this.capturedPokemonsSource.next(Math.max(currentCount - 1, 0));
  }
  // Método para reiniciar completamente el estado
  resetCapturedPokemons() {
    this.capturedPokemonsSource.next(0);
    this.capturedPokemonsListSource.next([]);
  }

}