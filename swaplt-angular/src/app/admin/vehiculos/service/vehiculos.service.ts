// src/app/admin/vehiculos/service/vehiculos.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class VehiculosService {
  private apiUrl = `${environment.apiUrl}/vehiculos`;

  constructor(private http: HttpClient) {}

  // Método para obtener el token de autenticación (esto es solo un ejemplo)
  private getAuthToken(): string {
    return localStorage.getItem('token') || ''; // Si usas localStorage o donde guardes el token
  }

  // Obtener todos los vehículos con soporte para paginación
  getVehiculos(page: number = 1, perPage: number = 10): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
      
    return this.http.get<any[]>(this.apiUrl, { headers, params });
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

  // Obtener usuarios
  getUsuarios(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    return this.http.get<any[]>(`${environment.apiUrl}/users`, { headers });
  }
}
