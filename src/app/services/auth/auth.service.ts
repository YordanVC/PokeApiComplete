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
  private tokenKey='authToken'
  
  constructor(private httpClient:HttpClient, 
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

  private getToken(): string | null {
    return this.storageService.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() < exp;
  }

  logout(): void {
    this.storageService.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }
}
