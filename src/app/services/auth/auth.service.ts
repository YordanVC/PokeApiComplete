import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UniversalStorageService } from '../localStorage/universal-storage.service';
import { PokemonCapturedStateService } from '../pokemon-captured-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/pokedex';
  private tokenKey = 'authToken'
  private authenticatedSubject = new BehaviorSubject<boolean>(false); // Estado inicial
  isAuthenticated$ = this.authenticatedSubject.asObservable();

  constructor(private httpClient: HttpClient,
    private router: Router,
    private storageService: UniversalStorageService,
  ) { this.setAuthenticated(this.isAuthenticated()); }

  login(username: string, password: string): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/user/login`, { username, password }, { observe: 'response' }).pipe(
      tap(response => {
        const token = response.headers.get('Authorization');
        if (token) {
          this.setToken(token);
          this.setAuthenticated(this.isAuthenticated());
          console.log('Token:', token);
        } else {
          console.error('No existe token en la respuesta del servidor');
          console.log('Token:', token);
        }
      })
    );
  }

  setAuthenticated(isAuthenticated: boolean) {
    this.authenticatedSubject.next(isAuthenticated);
  }

  getAuthenticated(): boolean {
    return this.authenticatedSubject.value;
  }

  register(username: string, email: string, password: string): Observable<void> {
    const user = { username, email, password };
    return this.httpClient.post<void>(`${this.apiUrl}/user/register`, user);
  }
  private setToken(token: string): void {
    this.storageService.setItem(this.tokenKey, token);
  }

  public getToken(): string | null {
    const token = this.storageService.getItem(this.tokenKey);
    return token;
  }

  logout(): void {
    this.storageService.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
  
    const payload = this.decodeToken(token);
  
    // Asegúrate de que el payload contiene el campo exp
    if (payload.exp) {
      const exp = payload.exp * 1000;  // Convertir el tiempo de expiración a milisegundos
      
      // Comparar la fecha de expiración con el tiempo actual
      if (Date.now() > exp) {
        return false;
      }
    } else {
    }
    // Si no hay expiración, o la expiración es válida
    return true;
  }
  

  private decodeToken(token: string): any {
    try {
      // Decodificar la parte del payload
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error('Error decodificando token', error);
      return {};
    }
  }

  getCurrentUsername(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = this.decodeToken(token);
      return payload.sub || payload.username; // Usar 'sub' si es un JWT estándar
    } catch (error) {
      console.error('Error obteniendo username', error);
      return null;
    }
  }
}
