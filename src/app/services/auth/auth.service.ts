import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { UniversalStorageService } from '../localStorage/universal-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/pokedex';
  private tokenKey = 'authToken'

  constructor(private httpClient: HttpClient,
    private router: Router,
    private storageService: UniversalStorageService
  ) { }

  login(username: string, password: string): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/user/login`, { username, password }, { observe: 'response' }).pipe(
      tap(response => {
        const token = response.headers.get('Authorization');
        if (token) {
          this.setToken(token);
          console.log('Token:', token);
        } else {
          console.error('No existe token en la respuesta del servidor');
          console.log('Token:', token);
        }
      })
    );
  }

  register(username: string, email: string, password: string): Observable<void> {
    const user = { username, email, password };
    return this.httpClient.post<void>(`${this.apiUrl}/user/register`, user);
  }
  private setToken(token: string): void {
    this.storageService.setItem(this.tokenKey, token);
  }

  public getToken(): string | null {
    return this.storageService.getItem(this.tokenKey);
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

    try {
      // En tu caso, el token no parece ser un JWT estándar
      // Podrías necesitar un método diferente para decodificar
      const payload = this.decodeToken(token);

      // Si no hay expiración, asumir que el token es válido
      if (!payload.exp) {
        return true;
      }

      const exp = payload.exp * 1000;
      return Date.now() < exp;
    } catch (error) {
      console.error('Error al validar token', error);
      return false;
    }
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
