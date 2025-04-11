import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {
  private apiUrl = `${environment.apiUrl}/favoritos`;

  constructor(private http: HttpClient) { }

  agregarFavorito(vehiculoId: number): Observable<any> {
    return this.http.post(this.apiUrl, { vehiculo_id: vehiculoId });
  }

  obtenerFavoritos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  eliminarFavorito(vehiculoId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${vehiculoId}`);
  }
} 