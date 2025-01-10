import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { PokemonService } from '../../../pokemon.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { Subject, takeUntil } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [MaterialsModule, CommonModule],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css'
})
export class PokemonListComponent implements OnInit, OnDestroy {
  pokemons: any[] = [];
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
    // Escuchar los cambios en el select para actualizar el tipo de input
    this.filterForm.get('filterBy')?.valueChanges.subscribe(value => {
      if (value === 'id') {
        this.inputType = 'number'; // Cambiar a tipo número
      } else {
        this.inputType = 'text'; // Cambiar a tipo texto
      }
      // Limpiar el valor del filtro cuando se cambia el "filterBy"
      this.filterForm.get('filterValue')?.setValue('');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPokemons(offset: number) {
    this.pokemonService.getPokemons(offset).subscribe((data) => {
      this.pokemons = data.results.map((pokemon: any, index: number) => ({
        id: index + offset + 1,
        name: pokemon.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + offset + 1}.png`
      }));
      this.totalPokemons = data.count;
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
      console.log('El modal se ha cerrado', result);
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
            image: pokemon.sprites.front_default
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

  validateInput(event: KeyboardEvent): boolean {
    // Si el tipo de input es número, permitir solo números
    if (this.inputType === 'number') {
      return /[0-9]/.test(event.key) || event.key === 'Backspace' || event.key === 'Delete';
    }
    
    // Si es texto, permitir solo letras (incluyendo ñ y letras acentuadas)
    const pattern = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]$/;
    return pattern.test(event.key) || event.key === 'Backspace' || event.key === 'Delete';
  }

}
