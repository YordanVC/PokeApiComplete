import { Component, Inject } from '@angular/core';
import { MaterialsModule } from '../../materials/materials.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../pokemon.service';
import { EvolutionChain, Pokemon, Stat } from '../../models/pokemon';
import { PokemonStatsComponent } from '../pokemon-stats/pokemon-stats.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [MaterialsModule,CommonModule,PokemonStatsComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  pokemon: Pokemon | undefined;
  about: string = '';
  stats: Stat[] = [];
  evolution: string[] = [];
  moves: string[] = [];
  abilities: string[] = []; 

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
    private pokemonService: PokemonService
  ) {}

  ngOnInit() {
    // Asegúrate de que el id sea un número
    const pokemonId = Number(this.data.id);
    this.loadPokemonDetails(pokemonId);
  }

  loadPokemonDetails(pokemonId: number) {
    this.pokemonService.getPokemonFullDetails(pokemonId).subscribe(response => {
      console.log(response);  // Verifica la respuesta real del servidor
      this.pokemon = response.details;
      this.stats = response.details.stats;
      this.moves = response.details.moves.map((move: { move: { name: string } }) => move.move.name);
      this.about = response.species.flavor_text_entries.find(
        (entry: { language: { name: string; }; }) => entry.language.name === 'es'
      )?.flavor_text ?? 'No information available';
      this.abilities = response.details.abilities.map((ability: { ability: { name: string } }) => ability.ability.name);
      // Procesamos la evolución
      this.evolution = this.getEvolutionChain(response.evolution.chain);
    });
  }
  

  getEvolutionChain(evolutionChain: any): string[] {
    let evolutions: string[] = [];
    let currentEvolution = evolutionChain;
  
    // Recorremos toda la cadena de evolución
    while (currentEvolution) {
      // Agregar la especie actual
      evolutions.push(currentEvolution.species.name);
      
      // Si hay una evolución, seguimos con el siguiente 
      currentEvolution = currentEvolution.evolves_to[0];  // Se toma solo el primer Pokémon de la cadena evolutiva
    }
  
    return evolutions;
  }
}
