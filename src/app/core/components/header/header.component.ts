import { PokemonService } from './../../../services/pokemon/pokemon.service';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { MyPokemonsResponse } from '../../../models/pokemon';
import { UserPokemonsComponent } from '../../../pokemon/components/user-pokemons/user-pokemons.component';
import { MatDialog } from '@angular/material/dialog';
import { PokemonCapturedStateService } from '../../../services/pokemon-captured-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [MaterialsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  capturedPokemonsCount = 0;
  myPokemons: MyPokemonsResponse[] = [];
  private authSubscription: Subscription= new Subscription();


  constructor(
    public authService: AuthService,
    private pokemonService: PokemonService,
    private pokemonCapturedStateService: PokemonCapturedStateService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    // Suscríbete al estado de autenticación
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) { 
        this.loadUserPokemons();
        
        // Suscribirse al observable de conteo de Pokémon capturados
        this.pokemonCapturedStateService.capturedPokemons$.subscribe(count => {
          this.capturedPokemonsCount = count;
          console.log('Cantidad de pokemons capturados:', this.capturedPokemonsCount);
        });
      }
    });
  }

  // Agrega el método ngOnDestroy para limpiar la suscripción
  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadUserPokemons() {
    this.pokemonService.getUserPokemons().subscribe({
      next: (pokemons) => {
        this.myPokemons = pokemons;
        this.pokemonCapturedStateService.setCapturedPokemonsList(pokemons);
      },
      error: (error) => {
        console.error('Error al cargar los Pokémon', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.capturedPokemonsCount = 0;
  }

  openPokemonDialog() {
    this.dialog.open(UserPokemonsComponent, {
      width: '800px',
      height: '600px'
    });
  }
}
