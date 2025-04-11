import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, catchError, tap, switchMap, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehiculos`;

  constructor(private http: HttpClient) { }

  // Método para obtener el token de autenticación
  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }
  
  // Método para extraer información del usuario del token JWT
  private getUserFromToken(token: string): any {
    if (!token) return null;
    
    try {
      // El token JWT tiene 3 partes separadas por punto
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;
      
      // La segunda parte contiene la información (payload)
      const payload = JSON.parse(atob(tokenParts[1]));
      
      console.log('Contenido completo del token JWT:', payload);
      
      // Buscar el ID del usuario en varios campos comunes del token
      const userId = payload.sub || payload.user_id || payload.id || 
                     (payload.user ? payload.user.id : null) || 
                     (payload.data ? payload.data.id : null);
      
      if (userId) {
        // Verificar basándose exclusivamente en email_verified_at
        let isVerified = false;
        let email_verified_at = null;
        
        // Comprobar en diferentes ubicaciones donde podría estar email_verified_at
        if (payload.email_verified_at !== undefined) {
          email_verified_at = payload.email_verified_at;
        } else if (payload.user && payload.user.email_verified_at !== undefined) {
          email_verified_at = payload.user.email_verified_at;
        } else if (payload.data && payload.data.email_verified_at !== undefined) {
          email_verified_at = payload.data.email_verified_at;
        }
        
        // La regla: está verificado SOLO si email_verified_at tiene un valor no nulo y no vacío
        isVerified = email_verified_at !== null && 
                    email_verified_at !== '' && 
                    email_verified_at !== 'null';
        
        console.log('Campo email_verified_at:', email_verified_at);
        console.log('Estado final de verificación del usuario:', isVerified);
        
        // Crear un objeto de usuario con todos los campos importantes
        const user: {
          id: any;
          name: any;
          verified: boolean;
          email_verified_at?: any;
        } = { 
          id: userId, 
          name: payload.name || payload.username || payload.email || 'Usuario',
          verified: isVerified,
          email_verified_at: email_verified_at
        };
        
        console.log('Usuario final extraído del token:', user);
        return user;
      }
      
      return null;
    } catch (e) {
      console.error('Error al decodificar el token:', e);
      return null;
    }
  }

  // Obtener todos los vehículos
  getVehicles(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  // Obtener un vehículo por ID
  getVehicle(id: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers });
  }

  // Método para obtener el usuario actual (preferiblemente desde el token)
  getCurrentUser(): Observable<any> {
    console.log('Obteniendo usuario actual...');
    
    // Primero intentamos obtener la información del usuario desde el token
    const userFromToken = this.getUserFromToken(this.getAuthToken());
    
    if (userFromToken) {
      console.log('Usuario obtenido del token JWT:', userFromToken);
      return of(userFromToken);
    }
    
    // Si no tenemos información en el token, hacemos una petición al backend
    console.log('No se pudo obtener usuario del token, intentando con el backend...');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    
    return this.http.get<any>(`${environment.apiUrl}/me`, { headers }).pipe(
      tap(userData => {
        console.log('Usuario obtenido del backend:', userData);
        
        // Comprobar explícitamente si existe email_verified_at
        if (userData.email_verified_at !== undefined) {
          console.log('Campo email_verified_at encontrado:', userData.email_verified_at);
          const isVerified = userData.email_verified_at !== null && 
                           userData.email_verified_at !== '' && 
                           userData.email_verified_at !== 'null';
          console.log('Usuario verificado:', isVerified);
          
          // Añadir explícitamente un campo 'verified' para facilitar la verificación
          userData.verified = isVerified;
        } else {
          console.log('Campo email_verified_at NO encontrado en la respuesta del backend');
          userData.verified = false;
        }
      })
    );
  }

  // Comprobar si un usuario está verificado
  private isUserVerified(user: any): boolean {
    if (!user) return false;
    
    console.log('Verificando usuario:', user);
    
    // Verificación basada en email_verified_at
    if (user.email_verified_at !== undefined) {
      // Si tiene algún texto y no es null o cadena vacía, está verificado
      const verified = user.email_verified_at !== null && 
                      user.email_verified_at !== '' && 
                      user.email_verified_at !== 'null';
      
      console.log('Valor de email_verified_at:', user.email_verified_at);
      console.log('Verificado según email_verified_at:', verified);
      return verified;
    }
    
    if (typeof user.verified === 'boolean') {
      console.log('Verificado según verified:', user.verified);
      return user.verified;
    }
    
    // Si no encontramos información de verificación, asumimos que no está verificado
    console.log('No se encontró información de verificación, asumiendo NO verificado');
    return false;
  }

  // Método para verificar si el usuario actual está verificado
  checkUserVerification(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => this.isUserVerified(user)),
      catchError(error => {
        console.error('Error al verificar usuario:', error);
        return of(false); // En caso de error, asumimos que no está verificado
      })
    );
  }

  // Crear un nuevo vehículo
  createVehicle(vehicleData: any): Observable<any> {
    // Usamos directamente el token sin verificación previa
    // Los controles de verificación ya se hacen en el componente
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    return this.http.post<any>(this.apiUrl, vehicleData, { headers });
  }

  // Actualizar un vehículo
  updateVehicle(id: number, vehicleData: any): Observable<any> {
    // Usamos directamente el token sin verificación previa
    // Los controles de verificación ya se hacen en el componente
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    return this.http.put<any>(`${this.apiUrl}/${id}`, vehicleData, { headers });
  }

  // Eliminar un vehículo
  deleteVehicle(id: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }

  // Obtener categorías de vehículos
  getCategories(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAuthToken()}`);
    return this.http.get<any[]>(`${environment.apiUrl}/categorias`, { headers });
  }
}
