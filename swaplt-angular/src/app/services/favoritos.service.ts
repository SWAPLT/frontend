import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

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
    kilometros: number;
    combustible: string;
    imagen: string;
    // ... otras propiedades del vehículo
  };
}

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {
  private apiUrl = `${environment.apiUrl}/favoritos`;

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
    return this.http.post<Favorito>(
      this.apiUrl,
      { vehiculo_id: vehiculoId },
      { headers: this.getHeaders() }
    );
  }

  // Obtener todos los favoritos del usuario
  getFavoritos(): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Eliminar un favorito
  removeFavorito(favoritoId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${favoritoId}`,
      { headers: this.getHeaders() }
    );
  }
} 