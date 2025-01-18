import { PokemonService } from './../../../services/pokemon/pokemon.service';
import { Component, OnInit } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { MyPokemonsResponse } from '../../../models/pokemon';
import { UserPokemonsComponent } from '../../../pokemon/components/user-pokemons/user-pokemons.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  imports: [MaterialsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  myPokemons: MyPokemonsResponse[] = [];

  constructor(
    public authService: AuthService,
    private pokemonService: PokemonService,
    public dialog: MatDialog,
  ) { }
  ngOnInit() {
    // Cargar los Pokémons capturados al iniciar el componente
    if (this.authService.isAuthenticated()) {
      this.loadUserPokemons();
    }
  }

  loadUserPokemons() {
  this.pokemonService.getUserPokemons().subscribe({
    next: (pokemons) => {
      this.myPokemons = pokemons;
    },
    error: (error) => {
      console.error('Error al cargar los Pokémon', error);
    }
  });
}

  logout(): void {
    this.authService.logout();
  }
  openPokemonDialog() {
    this.dialog.open(UserPokemonsComponent, {
      width: '800px',
      height: '600px'
    });
  }
}
