import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UniversalStorageService {
  private storage: Map<string, string> = new Map();

  constructor(@Inject(PLATFORM_ID) private platformId: any) { }

  setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    } else {
      this.storage.set(key, value); 
    }
  }

  getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    } else {
      return this.storage.get(key) || null;
    }
  }

  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    } else {
      this.storage.delete(key);
    }
  }
}
