import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { PokemonService } from '../../../pokemon.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { Subject, takeUntil } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Pokemon } from '../../../models/pokemon';

@Component({
    selector: 'app-pokemon-list',
    imports: [MaterialsModule, CommonModule],
    templateUrl: './pokemon-list.component.html',
    styleUrl: './pokemon-list.component.css'
})
export class PokemonListComponent implements OnInit, OnDestroy {
  pokemons: Pokemon[] = [];
  totalPokemons = 0;
  cols: number = 5;
  private destroy$ = new Subject<void>();
  filterValue: string = '';
  filterBy: string = 'name';
  filterForm: FormGroup;
  inputType: string = 'text'; // Tipo de input inicial
  private colorMap: { [key: string]: string } = {
    black: '#454545',  // Slightly lighter black for better visibility
    blue: '#4F61D6',   // Softened blue
    brown: '#96774F',  // Lighter brown
    gray: '#939393',   // Lighter gray
    green: '#41A13A',  // Softened green
    pink: '#FFD0EF',   // Lighter pink
    purple: '#8E77B3', // Softened purple
    red: '#FF3333',    // Softened red
    white: '#F5F5F5',  // Off-white for better contrast
    yellow: '#FFE633'  // Softened yellow
  };

  constructor(
    private pokemonService: PokemonService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver
      .observe([
        '(min-width: 1200px)',
        '(min-width: 900px) and (max-width: 1199px)',
        '(min-width: 600px) and (max-width: 899px)',
        '(min-width: 400px) and (max-width: 599px)',
        '(max-width: 399px)'
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.breakpoints['(min-width: 1200px)']) {
          this.cols = 5;
        } else if (result.breakpoints['(min-width: 900px) and (max-width: 1199px)']) {
          this.cols = 4;
        } else if (result.breakpoints['(min-width: 600px) and (max-width: 899px)']) {
          this.cols = 3;
        } else if (result.breakpoints['(min-width: 400px) and (max-width: 599px)']) {
          this.cols = 2;
        } else {
          this.cols = 1;
        }
      });

    this.filterForm = this.fb.group({
      filterValue: [''],
      filterBy: ['name']
    });
  }
  pokemonColors: { [key: number]: string } = {};
  private defaultColor: string = '#939393';

  ngOnInit() {
    this.loadPokemons(0);

    // Escuchar cambios en el valor del filtro
    this.filterForm.get('filterValue')?.valueChanges.subscribe((value) => {
      if (this.inputType === 'text') {
        // Limpiar cualquier carácter no permitido para texto
        const cleanedValue = value.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g, '');
        if (value !== cleanedValue) {
          this.filterForm.get('filterValue')?.setValue(cleanedValue, { emitEvent: false });
        }
      }
    });

    // Cambiar el tipo de input al cambiar el filtro
    this.filterForm.get('filterBy')?.valueChanges.subscribe((value) => {
      this.inputType = value === 'id' ? 'number' : 'text';
      this.filterForm.get('filterValue')?.setValue(''); // Limpiar el input
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPokemons(offset: number): void {
    const maxPokemons = 1025;

    // Asegurar que el offset no supere el límite
    const adjustedOffset = Math.min(offset, maxPokemons - 20);

    this.pokemonService.getPokemons(adjustedOffset).subscribe({

      next: (data) => {
        this.pokemons = data.pokemons;
        this.totalPokemons = data.total;
        this.pokemons.forEach(pokemon => {
          this.loadPokemonColor(pokemon.id);
        });
      },
      error: (err) => {
        console.error('Error al cargar los Pokémon:', err);
      }
    });
  }

  loadPokemonColor(pokemonId: number): void {
    this.pokemonService.getPokemonSpecies(pokemonId.toString()).subscribe({
      next: (speciesResponse) => {
        const colorName = speciesResponse.color.name.toLowerCase();
        this.pokemonColors[pokemonId] = this.colorMap[colorName] || '#939393';
      },
      error: (err) => {
        console.error('Error al cargar el color del Pokémon:', err);
        this.pokemonColors[pokemonId] = '#939393'; // Default color
      }
    });
  }
  getCardStyle(pokemonId: number) {
    const color = this.pokemonColors[pokemonId] || this.defaultColor;
    return {
      'background-color': color,
      'transition': 'all 0.3s ease',
      'box-shadow': '0 2px 4px rgba(0,0,0,0.2)'
    };
  }

  getTextStyle(pokemonId: number) {
    const color = this.pokemonColors[pokemonId] || this.defaultColor;
    return {
      'color': this.isLightColor(color) ? '#000000' : '#ffffff'
    };
  }

  private isLightColor(color: string): boolean {
    if (!color) return true; // Valor por defecto si no hay color

    try {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      // Validar que los valores RGB sean números válidos
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return true; // Valor por defecto si hay error en la conversión
      }

      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 180;
    } catch (error) {
      console.error('Error al procesar el color:', error);
      return true; // Valor por defecto si hay error
    }
  }

  onPageChange(event: any): void {
    const pageIndex = event.pageIndex;
    const pageSize = event.pageSize;

    // Calcula el offset basándote en la página y el tamaño de la página
    let offset = pageIndex * pageSize;
    
    if (offset + pageSize > this.totalPokemons) {
      offset = this.totalPokemons - pageSize;  // Ajusta el offset para no exceder el total
    }

    // Cargar los Pokémon
    this.loadPokemons(offset);
  }

  openPokemonModal(pokemon: any) {
    // Abre el modal y pasa el Pokémon al componente modal
    const dialogRef = this.dialog.open(ModalComponent, {
      data: { id: pokemon.id }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
    });
  }

  applyFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    let filterValue = input.value.trim().toLowerCase();

    // Si es tipo texto, eliminar cualquier carácter que no sea letra
    if (this.inputType === 'text') {
      filterValue = filterValue.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g, '');
      input.value = filterValue; // Actualiza el valor del input
    }
    if (filterValue) {
      // Llama a getPokemonByNameOrId para buscar en la API
      this.pokemonService.getPokemonByNameOrId(filterValue).subscribe(
        (pokemon) => {
          // Si se encuentra el Pokémon, lo agregamos a la lista
          this.pokemons = [{
            id: pokemon.id,
            name: pokemon.name,
            sprites: { front_default: pokemon.sprites.front_default },
            types: [],
            abilities: [],
            stats: [],
            moves: []
          }];
          this.totalPokemons = 1; // Solo un resultado
        },
        (error) => {
          console.error('No se encontró el Pokémon:', error);
          this.pokemons = []; // Vacía la lista si no se encuentra
          this.totalPokemons = 0;
        }
      );
    } else {
      // Si el filtro está vacío, recargamos los primeros 20 Pokémon
      this.loadPokemons(0);
    }
  }

  //validar input
  validateInput(event: KeyboardEvent): boolean {
    const inputType = this.inputType;

    if (inputType === 'number') {
      // Permitir solo números, backspace y delete
      return /[0-9]/.test(event.key) || ['Backspace', 'Delete'].includes(event.key);
    }

    if (inputType === 'text') {
      // Permitir solo letras, espacios, ñ y caracteres acentuados
      return /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]$/.test(event.key) || ['Backspace', 'Delete'].includes(event.key);
    }

    return true;
  }

}
