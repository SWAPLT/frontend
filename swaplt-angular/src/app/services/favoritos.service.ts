import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, switchMap, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { catchError, tap } from 'rxjs/operators';
import { Favorito } from '../models/favorito.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {
  private apiUrl = `${environment.apiUrl}/favoritos`;
  private favoritosSubject = new BehaviorSubject<Favorito[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Añadir un vehículo a favoritos
  addFavorito(vehiculoId: number): Observable<Favorito> {
    const headers = this.getHeaders();
    return this.http.post<Favorito>(this.apiUrl, { vehiculo_id: vehiculoId }, { headers }).pipe(
      tap(() => this.loadFavoritos()),
      catchError(error => {
        console.error('Error adding favorite:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtener todos los favoritos del usuario
  getFavoritos(): Observable<Favorito[]> {
    const headers = this.getHeaders();
    return this.http.get<Favorito[]>(this.apiUrl, { headers }).pipe(
      catchError(error => {
        console.error('Error getting favorites:', error);
        return throwError(() => error);
      })
    );
  }

  // Eliminar un favorito
  removeFavorito(vehiculoId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.getFavoritos().pipe(
      switchMap(favoritos => {
        const favorito = favoritos.find(f => f.vehiculo_id === vehiculoId);
        if (!favorito) {
          return throwError(() => new Error('Favorito no encontrado'));
        }
        return this.http.delete(`${this.apiUrl}/${favorito.id}`, { headers }).pipe(
          tap(() => this.loadFavoritos()),
          catchError(error => {
            console.error('Error removing favorite:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  // Eliminar favorito por ID del favorito
  removeFavoritoById(favoritoId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/${favoritoId}`, { headers }).pipe(
      tap(() => this.loadFavoritos()),
      catchError(error => {
        console.error('Error removing favorite by ID:', error);
        return throwError(() => error);
      })
    );
  }

  // Cargar favoritos
  loadFavoritos(): void {
    this.getFavoritos().subscribe({
      next: (favoritos) => {
        this.favoritosSubject.next(favoritos);
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.favoritosSubject.next([]);
      }
    });
  }

  // Obtener el estado actual de los favoritos
  getFavoritosState(): Observable<Favorito[]> {
    return this.favoritosSubject.asObservable();
  }
} 