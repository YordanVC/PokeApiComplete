import { ChangeDetectionStrategy, Component, Inject, OnInit, Optional } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../../services/pokemon/pokemon.service';
import { MyPokemonsResponse, Pokemon } from '../../../models/pokemon';
import { PokemonStatsComponent } from '../../../shared/pokemon-stats/pokemon-stats.component';
import { PokemonCapturedStateService } from '../../../services/pokemon-captured-state.service';
import { DialogConfirmationComponent } from '../../dialog-confirmation/dialog-confirmation.component';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-modal',
  imports: [MaterialsModule, PokemonStatsComponent, CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})

export class ModalComponent implements OnInit {
  pokemon: Pokemon | undefined;
  about: string = '';
  stats: { base_stat: number; stat: { name: string } }[] = [];
  evolution: string[] = [];
  evolutionDetails: { name: string, sprite: string }[] = [];
  moves: string[] = [];
  abilities: string[] = [];
  isLoading: boolean = true;
  mainColor: string = '';
  capturedPokemonsList: MyPokemonsResponse[] = [];
  
  private typeColorMap: { [key: string]: string } = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  };

  private colorMap: { [key: string]: string } = {
    black: '#303030',
    blue: '#3B4CCA',
    brown: '#826647',
    gray: '#808080',
    green: '#2C8A25',
    pink: '#FDB9E9',
    purple: '#7B62A3',
    red: '#FF0000',
    white: '#FFFFFF',
    yellow: '#FFDE00'
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private pokemonService: PokemonService,
    private pokemonCapturedStateService: PokemonCapturedStateService,
    private dialogRef: MatDialogRef<ModalComponent>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    const pokemonId = Number(this.data.id);
    this.loadPokemonDetails(pokemonId);

    this.pokemonCapturedStateService.capturedPokemonsList$.subscribe(
      pokemons => {
        this.capturedPokemonsList = pokemons;
      }
    );
  }

  loadPokemonDetails(pokemonId: number) {
    this.isLoading = true;
    this.pokemonService.getPokemonFullDetails(pokemonId.toString()).subscribe({
      next: (response) => {
        this.pokemon = response;
        this.stats = response.stats || [];
        this.moves = response.moves.map((m: { move: { name: string } }) => m.move.name);
        this.abilities = response.abilities?.map((a: { ability: { name: string } }) => a.ability.name) || [];
        this.evolution = response.evolutionChain || [];
        // obtener detalles de evolución
        if (response.evolutionChain && response.evolutionChain.length > 0) {
          this.pokemonService.getEvolutionDetails(
            response.evolutionChain,
            response.megaEvolutions
          ).subscribe(
            details => {
              this.evolutionDetails = details;
            }
          );
        }
        // Cargar los detalles de la especie
        this.loadPokemonSpecies(pokemonId);
      },
      error: (err) => {
        console.error('Error al cargar los detalles del Pokémon', err);
        this.isLoading = false;
      }
    });
  }

  loadPokemonSpecies(pokemonId: number) {
    this.pokemonService.getPokemonSpecies(pokemonId.toString()).subscribe({
      next: (speciesResponse) => {
        const description = speciesResponse.flavor_text_entries.find(
          (entry: { language: { name: string } }) => entry.language.name === 'es'
        );
        this.about = description ? description.flavor_text.replace(/\f/g, ' ') : 'No hay descripción disponible';

        // Establecer el color principal
        const colorName = speciesResponse.color.name.toLowerCase();
        this.mainColor = this.colorMap[colorName] || '#808080';
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar la especie del Pokémon', err);
        this.about = 'No hay descripción disponible';
        this.isLoading = false;
      }
    });
  }

addPokemon() {
   // Verificar si el Pokémon ya está capturado
   const isPokemonAlreadyCaptured = this.capturedPokemonsList.some(
    pokemon => pokemon.pokemonId === this.data.id
  );

  if (isPokemonAlreadyCaptured) {
    this.dialogRef.close();
    this.snackBar.open(
      `¡${this.pokemon?.name || 'Este Pokémon'} ya está en tu equipo!`,
      'Cerrar',
      {
        duration: 5000,
        panelClass: ['custom-snackbar'],
      }
    );
    return;
  }

  // Verificar si ya tiene el máximo de Pokémon
  if (this.capturedPokemonsList.length >= 6) {
    this.dialogRef.close();
    this.snackBar.open(
      'No puedes capturar más Pokémon. Ya tienes el máximo permitido (6).',
      'Cerrar',
      { duration: 5000 }
      
    );
    return;
  }

  // Usar el diálogo de confirmación existente
  const dialogRef = this.dialog.open(DialogConfirmationComponent, {
    data: {
      pokemonName: this.pokemon?.name || 'Pokémon'
    }
  });

  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    if (confirmed) {
      const pokemonId = this.data.id;
      this.pokemonService.addPokemon(pokemonId).subscribe({
        next: (response) => {
          if (response) {
            // Cargar el Pokémon recién capturado
            this.pokemonService.getUserPokemons().subscribe({
              next: (pokemons) => {
                // Buscar el Pokémon recién capturado
                const newPokemon = pokemons.find(p => p.pokemonId === pokemonId);
                
                if (newPokemon) {
                  // Agregar el Pokémon al servicio de estado
                  this.pokemonCapturedStateService.addCapturedPokemon(newPokemon);
                }
              },
              error: (error) => {
                console.error('Error al cargar los Pokémon', error);
              }
            });

            this.dialogRef.close({ success: true, pokemonId });
            this.snackBar.open(
              `¡${this.pokemon?.name} ha sido agregado a tu equipo!`,
              'Cerrar',
              { duration: 5000 }
            );
          } else {
            console.error('No se pudo agregar el Pokémon');
          }
        },
        error: (error) => {
          this.snackBar.open(
            'Hubo un error al intentar capturar el Pokémon.',
            'Cerrar',
            { duration: 5000 }
          );
        }
      });
    }
  });
}
  //metodos de estilos
  getBackgroundStyle() {
    return {
      'background-color': this.mainColor,
      'filter': 'brightness(0.9) saturate(1.2)'
    };
  }

  getTypeChipStyle(typeName: string) {
    const backgroundColor = this.typeColorMap[typeName.toLowerCase()] || '#A8A878';
    return {
      'background-color': backgroundColor,
      'color': this.isLightColor(backgroundColor) ? '#000' : '#fff',
      'border': 'none',
      'padding': '4px 12px',
      'margin': '0 4px',
      'font-size': '14px',
      'font-weight': '500',
      'text-transform': 'capitalize',
      'cursor': 'default'
    };
  }
  getTypeButtonStyle() {
    return {
      'background-color': this.mainColor,
      'color': this.isLightColor(this.mainColor) ? '#000' : '#fff'
    };
  }


  private isLightColor(color: string): boolean {
    // Convertir el color HEX a RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calcular la luminosidad
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 180;
  }
}


