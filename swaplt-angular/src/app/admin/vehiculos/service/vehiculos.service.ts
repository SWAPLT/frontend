// src/app/admin/vehiculos/service/vehiculos.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VehiculosService {
  private apiUrl = 'http://localhost:8000/api/vehiculos';

  constructor(private http: HttpClient) {}

  // Método para obtener el token de autenticación (esto es solo un ejemplo)
  private getAuthToken(): string {
    return localStorage.getItem('token') || ''; // Si usas localStorage o donde guardes el token
  }

  // Obtener todos los vehículos
  getVehiculos(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  // Crear vehículo
  createVehiculo(vehiculo: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    return this.http.post<any>(this.apiUrl, vehiculo, { headers });
  }

  // Actualizar vehículo
  updateVehiculo(id: number, vehiculo: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    return this.http.put<any>(`${this.apiUrl}/${id}`, vehiculo, { headers });
  }

  // Eliminar vehículo
  deleteVehiculo(id: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }

  // Agrega este método al final del servicio
  getUsuarios(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    return this.http.get<any[]>('http://127.0.0.1:8000/api/users', { headers });
  }
}
