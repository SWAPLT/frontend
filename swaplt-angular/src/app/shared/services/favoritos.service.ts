import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {
  private favoritosKey = 'favoritos';
  private favoritosSubject = new BehaviorSubject<any[]>(this.getFavoritosFromStorage());

  constructor() { }

  private getFavoritosFromStorage(): any[] {
    const favoritosStr = localStorage.getItem(this.favoritosKey);
    return favoritosStr ? JSON.parse(favoritosStr) : [];
  }

  private saveFavoritosToStorage(favoritos: any[]): void {
    localStorage.setItem(this.favoritosKey, JSON.stringify(favoritos));
    this.favoritosSubject.next(favoritos);
  }

  getFavoritos(): Observable<any[]> {
    return this.favoritosSubject.asObservable();
  }

  addFavorito(vehiculo: any): void {
    const favoritos = this.getFavoritosFromStorage();
    if (!this.isFavorito(vehiculo.id)) {
      favoritos.push(vehiculo);
      this.saveFavoritosToStorage(favoritos);
    }
  }

  removeFavorito(vehiculoId: number): void {
    const favoritos = this.getFavoritosFromStorage();
    const updatedFavoritos = favoritos.filter(v => v.id !== vehiculoId);
    this.saveFavoritosToStorage(updatedFavoritos);
  }

  isFavorito(vehiculoId: number): boolean {
    const favoritos = this.getFavoritosFromStorage();
    return favoritos.some(v => v.id === vehiculoId);
  }

  clearFavoritos(): void {
    this.saveFavoritosToStorage([]);
  }
} 