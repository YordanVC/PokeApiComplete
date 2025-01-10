import { Routes } from '@angular/router';
import { PokemonListComponent } from './pokemon/components/pokemon-list/pokemon-list.component';
import { NoFoundComponent } from './shared/components/no-found/no-found.component';
export const routes: Routes = [
    {
        path: '',
        component:PokemonListComponent
    },
    { path: '**', component: NoFoundComponent } 
];
