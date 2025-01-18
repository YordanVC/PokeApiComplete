import { PokemonService } from './../../../services/pokemon/pokemon.service';
import { Component, OnInit } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { MyPokemonsResponse } from '../../../models/pokemon';

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
    private router: Router
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
        
        if (error.status === 401 || error.message === 'Usuario no autenticado') {
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
