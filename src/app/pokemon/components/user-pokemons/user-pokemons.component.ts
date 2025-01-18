import { Component, OnInit } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { MatDialogRef } from '@angular/material/dialog';
import { PokemonService } from '../../../services/pokemon/pokemon.service';
import { catchError, forkJoin, map, of } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MyPokemonsResponse } from '../../../models/pokemon';

interface PokemonDetail {
  id: number;
  name: string;
  sprite: string;
}

@Component({
  selector: 'app-user-pokemons',
  imports: [MaterialsModule],
  templateUrl: './user-pokemons.component.html',
  styleUrl: './user-pokemons.component.css'
})
export class UserPokemonsComponent implements OnInit {
  myPokemons: MyPokemonsResponse[] = [];
  dataSource = new MatTableDataSource<PokemonDetail>([]);
  displayedColumns: string[] = ['id', 'name', 'sprite', 'actions'];

  constructor(
    public dialogRef: MatDialogRef<UserPokemonsComponent>,
    private pokemonService: PokemonService
  ) {}

  ngOnInit() {
    this.loadUserPokemons();
  }

  loadUserPokemons() {
    this.pokemonService.getUserPokemons().subscribe({
      next: (pokemons) => {
        this.myPokemons = pokemons;
        
        // Opcional: Cargar detalles de los Pokémons
        const pokemonDetailsObservables = pokemons.map(pokemon => 
          this.pokemonService.getPokemonByNameOrId(pokemon.pokemonId.toString()).pipe(
            map(details => ({
              id: details.id,
              name: details.name,
              sprite: details.sprites.front_default,
              originalPokemonId: pokemon.pokemonId,
              estado: pokemon.estado
            }))
          )
        );
  
        forkJoin(pokemonDetailsObservables).subscribe({
          next: (details) => {
            this.dataSource.data = details;
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar los Pokémon', error);
      }
    });
  }

  releasePokemon(pokemonId: number) {
    console.log('pokemon a liberar: ', pokemonId);
    this.pokemonService.removePokemon(pokemonId).subscribe({
      next: (result) => {
        if (result) {
          console.log('Pokémon liberado exitosamente');
          this.loadUserPokemons();
        } else {
          console.error('No se pudo liberar el Pokémon');
        }
      },
      error: (error) => {
        console.error('Error al liberar Pokémon', error);
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}