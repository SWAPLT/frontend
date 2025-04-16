import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin, BehaviorSubject, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { UsersService } from '../../../admin/usuarios/service/users.service';

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {
  private apiUrl = `${environment.apiUrl}/vehiculos`;
  private vehiculosConPropietarios = new BehaviorSubject<any[]>([]);

  constructor(
    private http: HttpClient,
    private usersService: UsersService
  ) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      console.error('Error:', error.error.message);
    } else {
      // Error del lado del servidor
      console.error(
        `Código de error: ${error.status}, ` +
        `mensaje: ${error.error.message || error.message}`
      );
    }
    return throwError(() => new Error('Ocurrió un error al procesar la solicitud'));
  }

  getVehiculos(): Observable<any[]> {
    // Primero obtenemos los vehículos
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(vehiculos => {
        // Inicializamos los vehículos con propietario por defecto
        const vehiculosIniciales = vehiculos.map(vehiculo => ({
          ...vehiculo,
          propietario: { nombre: 'Cargando...', id: vehiculo.user_id }
        }));
        this.vehiculosConPropietarios.next(vehiculosIniciales);

        // Cargamos los propietarios progresivamente
        vehiculos.forEach((vehiculo, index) => {
          this.usersService.getUser(vehiculo.user_id).subscribe({
            next: (propietario) => {
              const vehiculosActuales = this.vehiculosConPropietarios.value;
              vehiculosActuales[index] = {
                ...vehiculosActuales[index],
                propietario: {
                  nombre: propietario?.name || 'Usuario SWAPLT',
                  id: propietario?.id
                }
              };
              this.vehiculosConPropietarios.next([...vehiculosActuales]);
            },
            error: (error) => {
              console.error('Error al cargar propietario:', error);
              const vehiculosActuales = this.vehiculosConPropietarios.value;
              vehiculosActuales[index] = {
                ...vehiculosActuales[index],
                propietario: {
                  nombre: 'Usuario SWAPLT',
                  id: vehiculo.user_id
                }
              };
              this.vehiculosConPropietarios.next([...vehiculosActuales]);
            }
          });
        });
      }),
      switchMap(() => this.vehiculosConPropietarios.asObservable()),
      catchError(this.handleError)
    );
  }

  searchVehiculos(query: string): Observable<any[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  filterVehiculos(filters: any): Observable<any[]> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<any[]>(`${this.apiUrl}/filter`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getVehiculo(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getVehiculoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      switchMap(response => {
        const vehiculo = response.vehiculo;
        // Inicializamos con propietario por defecto
        const vehiculoInicial = {
          ...vehiculo,
          propietario: { nombre: 'Cargando...', id: vehiculo.user_id }
        };

        // Cargamos el propietario
        return this.usersService.getUser(vehiculo.user_id).pipe(
          map(propietario => ({
            ...vehiculo,
            propietario: {
              nombre: propietario?.name || 'Usuario SWAPLT',
              id: propietario?.id
            },
            imagenes: vehiculo.imagenes.map((img: any) => ({
              id: img.id,
              url: img.url,
              orden: img.orden,
              vehiculo_id: img.vehiculo_id,
              preview_url: img.preview_url
            }))
          })),
          catchError(() => of({
            ...vehiculo,
            propietario: {
              nombre: 'Usuario SWAPLT',
              id: vehiculo.user_id
            },
            imagenes: vehiculo.imagenes.map((img: any) => ({
              id: img.id,
              url: img.url,
              orden: img.orden,
              vehiculo_id: img.vehiculo_id,
              preview_url: img.preview_url
            }))
          }))
        );
      }),
      catchError(this.handleError)
    );
  }
}
