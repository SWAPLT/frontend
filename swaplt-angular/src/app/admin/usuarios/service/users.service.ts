import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  // Obtener todos los usuarios con paginación
  getUsers(page: number = 1, perPage: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
      
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Obtener un usuario por ID
  getUser(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo usuario
  createUser(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }

  // Actualizar un usuario
  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, userData);
  }

  // Eliminar un usuario
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Cambiar rol a admin
  promoteToAdmin(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { rol: 'admin' });
  }

  // Cambiar rol a user
  demoteToUser(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { rol: 'user' });
  }
}
