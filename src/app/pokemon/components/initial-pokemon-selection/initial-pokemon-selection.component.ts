import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../../../services/pokemon/pokemon.service';
import { PokemonCapturedStateService } from '../../../services/pokemon-captured-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { DialogConfirmationComponent } from '../../dialog-confirmation/dialog-confirmation.component';
import { MatDialog } from '@angular/material/dialog';
import { MaterialsModule } from '../../../materials/materials.module';


interface InitialPokemon {
  id: number;
  name: string;
  sprite: string;
  description: string;
}
@Component({
  selector: 'app-initial-pokemon-selection',
  imports: [MaterialsModule],
  templateUrl: './initial-pokemon-selection.component.html',
  styleUrl: './initial-pokemon-selection.component.css'
})
export class InitialPokemonSelectionComponent implements OnInit {
  initialPokemons: InitialPokemon[] = [
    { 
      id: 7, 
      name: 'Squirtle', 
      sprite: '', 
      description: 'Un Pokémon de tipo Agua que es genial y tranquilo.'
    },
    { 
      id: 4, 
      name: 'Charmander', 
      sprite: '', 
      description: 'Un Pokémon de tipo Fuego con una llama ardiente en su cola.'
    },
    { 
      id: 25, 
      name: 'Pikachu', 
      sprite: '', 
      description: 'Un Pokémon eléctrico adorable y muy popular.' 
    },
    { 
      id: 1, 
      name: 'Bulbasaur', 
      sprite: '', 
      description: 'Un Pokémon de tipo Planta con un bulbo en su espalda.'
    }
  ];

  selectedPokemon: InitialPokemon | null = null;

  constructor(
    private pokemonService: PokemonService,
    private pokemonCapturedStateService:PokemonCapturedStateService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar

  ) {}

  ngOnInit() {
    // Cargar detalles de los Pokémon
    this.initialPokemons.forEach(pokemon => {
      this.pokemonService.getPokemonByNameOrId(pokemon.id.toString()).subscribe({
        next: (details) => {
          pokemon.sprite = details.sprites.front_default;
        },
        error: (error) => {
          console.error(`Error cargando detalles de ${pokemon.name}`, error);
        }
      });
    });
  }

  selectPokemon(pokemon: InitialPokemon) {
    this.selectedPokemon = pokemon;
  }

  confirmSelection() {
    if (!this.selectedPokemon) return;

    const dialogRef = this.dialog.open(DialogConfirmationComponent, {
      data: {
        message: `¿Estás seguro de elegir a ${this.selectedPokemon.name} como tu Pokémon inicial?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.pokemonService.addPokemon(this.selectedPokemon!.id).subscribe({
          next: () => {
            // Resetear estado de nuevo usuario
            this.authService.resetNewUserStatus();
            if (this.selectedPokemon) {
              this.pokemonCapturedStateService.incrementCapturedPokemons();
            }
            this.snackBar.open(
              `¡${this.selectedPokemon!.name} ha sido agregado a tu equipo!`,
              'Cerrar',
              { duration: 5000 }
            );

            // Redirigir al home
            this.router.navigate(['/home']);
          },
          error: (error) => {
            console.error('Error al agregar Pokémon inicial', error);
            this.snackBar.open(
              'Hubo un error al seleccionar tu Pokémon inicial',
              'Cerrar',
              { duration: 5000 }
            );
          }
        });
      }
    });
  }
}