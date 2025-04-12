import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, switchMap, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { catchError, tap } from 'rxjs/operators';

interface Favorito {
  id: number;
  user_id: number;
  vehiculo_id: number;
  vehiculo: {
    id: number;
    marca: string;
    modelo: string;
    anio: number;
    precio: number;
    kilometraje: number;
    transmision: string;
    tipo_combustible: string;
    imagen_url: string;
    estado: string;
    color: string;
    fuerza: number;
    capacidad_motor: number;
    numero_puertas: number;
    plazas: number;
    descripcion: string;
  };
}

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
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    return this.http.post<Favorito>(
      this.apiUrl,
      { 
        vehiculo_id: vehiculoId,
        user_id: user.id
      },
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.loadFavoritos()),
      catchError(error => {
        console.error('Error al añadir favorito:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtener todos los favoritos del usuario
  getFavoritos(): Observable<Favorito[]> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    return this.http.get<Favorito[]>(`${this.apiUrl}?user_id=${user.id}&include=vehiculo`, { headers: this.getHeaders() })
      .pipe(
        tap(favoritos => {
          // Asegurarse de que todos los vehículos tengan los campos necesarios
          favoritos.forEach(favorito => {
            if (favorito.vehiculo) {
              favorito.vehiculo.kilometraje = favorito.vehiculo.kilometraje || 0;
              favorito.vehiculo.transmision = favorito.vehiculo.transmision || 'No especificado';
              favorito.vehiculo.tipo_combustible = favorito.vehiculo.tipo_combustible || 'No especificado';
              favorito.vehiculo.anio = favorito.vehiculo.anio || 0;
            }
          });
          this.favoritosSubject.next(favoritos);
        }),
        catchError(error => {
          if (error.status === 404) {
            this.favoritosSubject.next([]);
            console.log('No hay vehículos en favoritos');
            return of([]);
          }
          console.error('Error al obtener favoritos:', error);
          return throwError(() => error);
        })
      );
  }

  // Eliminar un favorito
  removeFavorito(vehiculoId: number): Observable<any> {
    return this.getFavoritos().pipe(
      switchMap(favoritos => {
        const favorito = favoritos.find(f => f.vehiculo_id === vehiculoId);
        if (!favorito) {
          return throwError(() => new Error('Favorito no encontrado'));
        }
        return this.http.delete(
          `${this.apiUrl}/${favorito.id}`,
          { headers: this.getHeaders() }
        );
      }),
      tap(() => {
        const currentFavoritos = this.favoritosSubject.value;
        const updatedFavoritos = currentFavoritos.filter(f => f.vehiculo_id !== vehiculoId);
        this.favoritosSubject.next(updatedFavoritos);
        this.loadFavoritos();
      }),
      catchError(error => {
        console.error('Error al eliminar favorito:', error);
        return throwError(() => error);
      })
    );
  }

  // Eliminar favorito por ID del favorito
  removeFavoritoById(favoritoId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${favoritoId}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => {
        const currentFavoritos = this.favoritosSubject.value;
        const updatedFavoritos = currentFavoritos.filter(f => f.id !== favoritoId);
        this.favoritosSubject.next(updatedFavoritos);
        this.loadFavoritos();
      }),
      catchError(error => {
        console.error('Error al eliminar favorito:', error);
        return throwError(() => error);
      })
    );
  }

  // Cargar favoritos
  loadFavoritos(): void {
    this.getFavoritos().subscribe();
  }

  // Obtener el estado actual de los favoritos
  getFavoritosState(): Observable<Favorito[]> {
    return this.favoritosSubject.asObservable();
  }
} 