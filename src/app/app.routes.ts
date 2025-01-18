import { Routes } from '@angular/router';
import { PokemonListComponent } from './pokemon/components/pokemon-list/pokemon-list.component';
import { NoFoundComponent } from './shared/components/no-found/no-found.component';
import { LoginComponent } from './shared/components/login/login.component';
import { authGuard } from './guard/auth.guard';
import { athenticatedGuard } from './guard/athenticated.guard';
import { RegisterComponent } from './shared/components/register/register.component';
export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        canActivate:[athenticatedGuard]
    },
    {
        path: 'register',
        component: RegisterComponent,
        canActivate:[athenticatedGuard]
    },
    {
        path: 'home',
        component: PokemonListComponent,
        canActivate: [authGuard]  // Usa el guard funcional
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    { 
        path: '**', 
        component: NoFoundComponent 
    }
];