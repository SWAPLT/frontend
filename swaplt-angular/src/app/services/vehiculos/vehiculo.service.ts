import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Vehiculo {
  id?: number;
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
}

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private apiUrl = `${environment.apiUrl}/vehiculos`;

  constructor(private http: HttpClient) { }

  // Crear un nuevo vehículo
  crear(vehiculo: Vehiculo): Observable<any> {
    return this.http.post<any>(this.apiUrl, vehiculo);
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
  actualizar(id: number, vehiculo: Vehiculo): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, vehiculo);
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
    return this.http.get<Vehiculo[]>(`${environment.apiUrl}/user/vehicles`);
  }
} 