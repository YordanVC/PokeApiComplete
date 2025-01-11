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
  standalone: true,
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
    this.pokemonService.getPokemons(offset).subscribe({

      next: (data) => {
        this.pokemons = data.pokemons;
        this.totalPokemons = data.total;
      },
      error: (err) => {
        console.error('Error al cargar los Pokémon:', err);
      }
    });
  }



  onPageChange(event: any) {
    const offset = event.pageIndex * event.pageSize;
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
