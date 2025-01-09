import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { PokemonService } from '../../../pokemon.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { Subject, takeUntil } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [MaterialsModule, CommonModule],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css'
})
export class PokemonListComponent implements OnInit, OnDestroy{
  pokemons: any[] = [];
  totalPokemons = 0;
  cols: number = 5;
  private destroy$ = new Subject<void>();
  
  constructor(
    private pokemonService: PokemonService,
    private dialog: MatDialog,
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
  }

  ngOnInit() {
    this.loadPokemons(0);
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
}
