import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehiculoImagenService {
  private apiUrl = `${environment.apiUrl}/vehiculos`;

  constructor(private http: HttpClient) { }

  // Subir imágenes a un vehículo
  subirImagenes(vehiculoId: number, imagenes: File[]): Observable<any> {
    const formData = new FormData();
    imagenes.forEach(imagen => {
      formData.append('imagenes[]', imagen);
    });

    return this.http.post(`${this.apiUrl}/${vehiculoId}/imagenes`, formData);
  }

  // Obtener todas las imágenes de un vehículo
  obtenerImagenes(vehiculoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${vehiculoId}/imagenes`);
  }

  // Eliminar una imagen específica
  eliminarImagen(vehiculoId: number, imagenId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${vehiculoId}/imagenes/${imagenId}`);
  }

  // Obtener la URL de una imagen específica
  obtenerUrlImagen(imagenId: number): string {
    return `${this.apiUrl}/imagenes/${imagenId}`;
  }
} 