import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUserVehiclesById(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}/vehiculos`);
  }

  getUserValoraciones(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}/valoraciones`);
  }

  enviarValoracion(data: {receptor_id: number, valor: number, comentario?: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/valoraciones`, data);
  }
} 