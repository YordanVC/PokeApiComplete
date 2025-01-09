import { Component, HostListener } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { PokemonService } from '../../../pokemon.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../../../shared/modal/modal.component';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [MaterialsModule, CommonModule],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css'
})
export class PokemonListComponent {
  pokemons: any[] = [];
  totalPokemons = 0;

  constructor(
    private pokemonService: PokemonService,
    private dialog: MatDialog 
  ) {
  }


  ngOnInit() {
    this.loadPokemons(0);
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
