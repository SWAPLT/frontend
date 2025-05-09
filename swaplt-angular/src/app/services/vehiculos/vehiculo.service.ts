import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';

export interface Vehiculo {
  id: number;
  user_id: number;
  categoria_id: number;
  marca: string;
  modelo: string;
  precio: number;
  anio: number;
  estado: 'nuevo' | 'usado';
  transmision: string;
  tipo_combustible: string;
  kilometraje: number;
  fuerza: number;
  capacidad_motor: number;
  color: string;
  ubicacion: string;
  matricula: string;
  numero_serie: string;
  numero_puertas: number;
  descripcion: string;
  vehiculo_robado: string;
  vehiculo_libre_accidentes: string;
  imagenes?: any[];
  mostrarEstadisticas?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private apiUrl = `${environment.apiUrl}/vehiculos`;

  constructor(private http: HttpClient) { }

  // Crear un nuevo vehículo
  crear(vehiculo: Vehiculo): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.post<any>(this.apiUrl, vehiculo, { headers }).pipe(
      catchError(error => {
        console.error('Error detallado:', error);
        if (error.error) {
          console.error('Mensaje de error del servidor:', error.error);
        }
        throw error;
      })
    );
  }

  // Obtener todos los vehículos
  obtenerTodos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.apiUrl);
  }

  // Obtener un vehículo específico
  obtenerPorId(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`);
  }

  // Actualizar un vehículo
  actualizarVehiculo(id: number, vehiculo: Vehiculo): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put<any>(`${this.apiUrl}/${id}`, vehiculo, { headers }).pipe(
      map(response => {
        if (response.success === false) {
          throw new Error(response.message);
        }
        return response;
      }),
      catchError(error => {
        console.error('Error al actualizar el vehículo:', error);
        throw error;
      })
    );
  }

  // Obtener un vehículo por ID
  obtenerVehiculoPorId(id: number): Observable<Vehiculo> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers }).pipe(
      map(response => {
        console.log('Respuesta completa del servidor:', response);
        if (response.vehiculo) {
          return response.vehiculo;
        } else if (response.data) {
          return response.data;
        } else {
          return response;
        }
      }),
      catchError(error => {
        console.error('Error al obtener el vehículo:', error);
        throw error;
      })
    );
  }

  // Eliminar un vehículo
  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Obtener categorías
  obtenerCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/categorias`);
  }

  getUserVehicles(): Observable<Vehiculo[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.get<any>(`${environment.apiUrl}/user/vehiculos`, { headers }).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message || 'Error al obtener los vehículos');
        }
      }),
      catchError(error => {
        console.error('Error al obtener los vehículos del usuario:', error);
        throw error;
      })
    );
  }
} 