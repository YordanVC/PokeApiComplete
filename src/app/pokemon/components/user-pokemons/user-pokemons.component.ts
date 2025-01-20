import { Component, OnInit } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PokemonService } from '../../../services/pokemon/pokemon.service';
import { catchError, forkJoin, map, of } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MyPokemonsResponse } from '../../../models/pokemon';
import { PokemonCapturedStateService } from '../../../services/pokemon-captured-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogConfirmationComponent } from '../../dialog-confirmation/dialog-confirmation.component';

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
    private pokemonService: PokemonService,
    private pokemonCapturedStateService: PokemonCapturedStateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog

  ) {}

  ngOnInit() {
    this.loadUserPokemons();
  }

  loadUserPokemons() {
    this.pokemonService.getUserPokemons().subscribe({
      next: (pokemons) => {
        this.myPokemons = pokemons;
        this.pokemonCapturedStateService.setCapturedPokemonsList(pokemons);
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
    // Buscar el nombre del Pokémon en el dataSource
    const pokemonToRelease = this.dataSource.data.find(p => p.id === pokemonId);

    // Abrir diálogo de confirmación
    const dialogRef = this.dialog.open(DialogConfirmationComponent, {
      data: { 
        pokemonName: pokemonToRelease?.name || 'Pokémon',
        message: `¿Estás seguro de que quieres liberar a ${pokemonToRelease?.name}?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.pokemonService.removePokemon(pokemonId).subscribe({
          next: (result) => {
            if (result) {
              this.pokemonCapturedStateService.decrementCapturedPokemons();
              // Actualizar directamente el dataSource
            const updatedData = this.dataSource.data.filter(p => p.id !== pokemonId);
            this.dataSource.data = updatedData;
              this.snackBar.open(
                `¡${pokemonToRelease?.name || 'Pokémon'} ha sido liberado de tu equipo!`,
                'Cerrar',
                { duration: 5000 }
              );
              
              this.loadUserPokemons();
            } else {
              console.error('No se pudo liberar el Pokémon');
              this.snackBar.open(
                'No se pudo liberar el Pokémon',
                'Cerrar',
                { duration: 5000 }
              );
            }
          },
          error: (error) => {
            console.error('Error al liberar Pokémon', error);
            this.snackBar.open(
              'Hubo un error al liberar el Pokémon',
              'Cerrar',
              { duration: 5000 }
            );
          }
        });
      }
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}