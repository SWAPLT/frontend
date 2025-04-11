import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {environment} from "../../environments/environment";  // Para manejar errores

interface UserProfile {
  rol: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  // otras propiedades del perfil del usuario
}

interface Vehicle {
  id: number;
  model: string;
  license_plate: string;
  // otras propiedades del vehículo
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getUserId() {
    throw new Error('Method not implemented.');
  }
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      }),
      catchError(this.handleError)  // Manejo de errores
    );
  }

  register(name: string, email: string, password: string, password_confirmation: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password, password_confirmation }).pipe(
      catchError(this.handleError)  // Manejo de errores
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`, this.getAuthHeaders()).pipe(
      tap((data: UserProfile) => {
        // Guardar todo el perfil como 'user'
        localStorage.setItem('user', JSON.stringify(data));
        // Puedes seguir guardando solo el rol por separado si quieres
        localStorage.setItem('userRole', data.rol);
      }),
      catchError(this.handleError)
    );
  }


  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken(); // Retorna `true` si hay un token
  }

  updateProfile(userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, userData, this.getAuthHeaders()).pipe(
      catchError(this.handleError)  // Manejo de errores
    );
  }

  // Obtiene la lista de vehículos del usuario (como ejemplo)
  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/vehicles`, this.getAuthHeaders()).pipe(
      catchError(this.handleError)  // Manejo de errores
    );
  }

  // Obtiene la lista de usuarios (para panel de administración)
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`, this.getAuthHeaders()).pipe(
      catchError(this.handleError)  // Manejo de errores
    );
  }

  // Obtener encabezados de autenticación
  private getAuthHeaders() {
    const token = this.getToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  // Manejo de errores
  private handleError(error: any) {
    let errorMessage = 'Ocurrió un error inesperado';
    if (error.error instanceof ErrorEvent) {
      // Error en el lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error en el servidor
      errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
    }
    return throwError(errorMessage);  // Retorna el error
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }


}
