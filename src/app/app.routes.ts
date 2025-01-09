import { Routes } from '@angular/router';
import { PokemonListComponent } from './pokemon/components/pokemon-list/pokemon-list.component';

export const routes: Routes = [
    {
        path: '',
        component:PokemonListComponent
    }
];
