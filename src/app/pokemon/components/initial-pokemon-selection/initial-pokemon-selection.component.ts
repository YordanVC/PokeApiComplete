import { Component, OnDestroy, OnInit } from '@angular/core';
import { PokemonService } from '../../../services/pokemon/pokemon.service';
import { PokemonCapturedStateService } from '../../../services/pokemon-captured-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MaterialsModule } from '../../../materials/materials.module';
import { ModalComponent } from '../modal/modal.component';
import { DialogConfirmationComponent } from '../../dialog-confirmation/dialog-confirmation.component';
import { Subject, takeUntil } from 'rxjs';

interface InitialPokemon {
  id: number;
  name: string;
  sprite: string;
  description: string;
  color?: string;
}

@Component({
  selector: 'app-initial-pokemon-selection',
  imports: [MaterialsModule],
  templateUrl: './initial-pokemon-selection.component.html',
  styleUrl: './initial-pokemon-selection.component.css'
})
export class InitialPokemonSelectionComponent implements OnInit,OnDestroy {
  private destroy$ = new Subject<void>();
  defaultColor: string = '#939393';
  private colorMap: { [key: string]: string } = {
    black: '#454545',
    blue: '#4F61D6',
    brown: '#96774F',
    gray: '#939393',
    green: '#41A13A',
    pink: '#FFD0EF',
    purple: '#8E77B3',
    red: '#FF3333',
    white: '#F5F5F5',
    yellow: '#FFE633'
  };

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
    private pokemonCapturedStateService: PokemonCapturedStateService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Cargar detalles de los Pokémon
    this.initialPokemons.forEach(pokemon => {
      this.loadPokemonDetails(pokemon);
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  loadPokemonDetails(pokemon: InitialPokemon) {
    this.pokemonService.getPokemonByNameOrId(pokemon.id.toString()).subscribe({
      next: (details) => {
        pokemon.sprite = details.sprites.front_default;
        this.loadPokemonColor(pokemon);
      },
      error: (error) => {
        console.error(`Error cargando detalles de ${pokemon.name}`, error);
      }
    });
  }

  loadPokemonColor(pokemon: InitialPokemon) {
    this.pokemonService.getPokemonSpecies(pokemon.id.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (speciesResponse) => {
          const colorName = speciesResponse.color.name.toLowerCase();
          pokemon.color = this.colorMap[colorName] || this.defaultColor;
        },
        error: (err) => {
          console.error('Error al cargar el color del Pokémon:', err);
          pokemon.color = this.defaultColor;
        }
      });
  }


  selectPokemon(pokemon: InitialPokemon) {
    this.selectedPokemon = pokemon;
  }

  openPokemonModal(pokemon: InitialPokemon) {
    const dialogRef = this.dialog.open(ModalComponent, {
      data: { id: pokemon.id }
    });
    this.pokemonCapturedStateService.capturedPokemons$.subscribe({
      next: (count) => {
        if (count > 0) {
          // Redirigir al home
          this.router.navigate(['/home']);
         }
      }
    });
  }

}