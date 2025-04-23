import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin, BehaviorSubject, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { UsersService } from '../../../admin/usuarios/service/users.service';

interface Propietario {
  nombre: string;
  id: number;
}

interface Vehiculo {
  id: number;
  user_id: number;
  propietario: Propietario;
  marca: string;
  modelo: string;
  [key: string]: any;
}

interface PropietarioResponse {
  vehiculoId: number;
  propietario: Propietario;
}

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {
  private apiUrl = `${environment.apiUrl}/vehiculos`;
  private vehiculosConPropietarios = new BehaviorSubject<Vehiculo[]>([]);

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

  getVehiculos(page: number = 1): Observable<any> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      switchMap((response: any) => {
        const vehiculos = response.data;
        // Inicializamos los vehículos con propietario por defecto
        const vehiculosIniciales = vehiculos.map((vehiculo: Vehiculo) => ({
          ...vehiculo,
          propietario: { nombre: 'Cargando...', id: vehiculo.user_id }
        }));
        this.vehiculosConPropietarios.next(vehiculosIniciales);

        // Creamos un array de observables para cargar todos los propietarios
        const propietariosObservables = vehiculos.map((vehiculo: Vehiculo) => 
          this.usersService.getUser(vehiculo.user_id).pipe(
            map(propietario => ({
              vehiculoId: vehiculo.id,
              propietario: {
                nombre: propietario?.name || 'Usuario SWAPLT',
                id: propietario?.id
              }
            })),
            catchError(error => {
              console.error('Error al cargar propietario:', error);
              return of({
                vehiculoId: vehiculo.id,
                propietario: {
                  nombre: 'Usuario SWAPLT',
                  id: vehiculo.user_id
                }
              });
            })
          )
        );

        // Usamos forkJoin para cargar todos los propietarios simultáneamente
        return forkJoin<PropietarioResponse[]>(propietariosObservables).pipe(
          map((propietarios: PropietarioResponse[]) => {
            const vehiculosActuales = this.vehiculosConPropietarios.value;
            propietarios.forEach(({ vehiculoId, propietario }) => {
              const index = vehiculosActuales.findIndex(v => v.id === vehiculoId);
              if (index !== -1) {
                vehiculosActuales[index] = {
                  ...vehiculosActuales[index],
                  propietario
                };
              }
            });
            this.vehiculosConPropietarios.next([...vehiculosActuales]);
            return {
              data: this.vehiculosConPropietarios.value,
              current_page: response.current_page,
              last_page: response.last_page,
              per_page: response.per_page,
              total: response.total
            };
          })
        );
      })
    );
  }

  searchVehiculos(query: string): Observable<any[]> {
    // Dividir la consulta en palabras
    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    
    // Crear los parámetros de búsqueda
    let params = new HttpParams();
    
    // Si hay dos palabras, asumimos que son marca y modelo
    if (searchTerms.length === 2) {
      params = params.set('marca', searchTerms[0])
                    .set('modelo', searchTerms[1]);
    } else {
      // Si es una sola palabra, la usamos como búsqueda general
      params = params.set('search', searchTerms[0]);
    }

    return this.http.get<any>(`${this.apiUrl}/search`, { params }).pipe(
      map(response => {
        if (response.success && response.data) {
          return Array.isArray(response.data) ? response.data : [];
        }
        return [];
      }),
      switchMap(vehiculos => {
        // Inicializamos los vehículos con propietario por defecto
        const vehiculosIniciales = vehiculos.map((vehiculo: Vehiculo) => ({
          ...vehiculo,
          propietario: { nombre: 'Cargando...', id: vehiculo.user_id }
        }));

        // Creamos un array de observables para cargar todos los propietarios
        const propietariosObservables = vehiculos.map((vehiculo: Vehiculo) => 
          this.usersService.getUser(vehiculo.user_id).pipe(
            map(propietario => ({
              vehiculoId: vehiculo.id,
              propietario: {
                nombre: propietario?.name || 'Usuario SWAPLT',
                id: propietario?.id
              }
            })),
            catchError(error => {
              console.error('Error al cargar propietario:', error);
              return of({
                vehiculoId: vehiculo.id,
                propietario: {
                  nombre: 'Usuario SWAPLT',
                  id: vehiculo.user_id
                }
              });
            })
          )
        );

        // Usamos forkJoin para cargar todos los propietarios simultáneamente
        return forkJoin<PropietarioResponse[]>(propietariosObservables).pipe(
          map((propietarios: PropietarioResponse[]) => {
            propietarios.forEach(({ vehiculoId, propietario }) => {
              const index = vehiculosIniciales.findIndex((v: Vehiculo) => v.id === vehiculoId);
              if (index !== -1) {
                vehiculosIniciales[index] = {
                  ...vehiculosIniciales[index],
                  propietario
                };
              }
            });
            return vehiculosIniciales;
          })
        );
      }),
      catchError(error => {
        console.error('Error en la búsqueda:', error);
        return of([]);
      })
    );
  }

  filterVehiculos(filters: any): Observable<any> {
    let params = new HttpParams();
    
    // Agregar cada filtro a los parámetros si existe
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        // Convertir valores numéricos a string
        const value = typeof filters[key] === 'number' ? filters[key].toString() : filters[key];
        params = params.set(key, value);
      }
    });

    console.log('Parámetros de filtro:', params.toString()); // Para depuración

    return this.http.get(`${this.apiUrl}/filter`, { params }).pipe(
      map((response: any) => {
        console.log('Respuesta del servidor:', response); // Para depuración
        // Asegurarnos de que la respuesta tenga el formato correcto
        return {
          data: Array.isArray(response.data.data) ? response.data.data : [],
          total: response.data.total || 0,
          current_page: response.data.current_page || 1,
          per_page: response.data.per_page || 10
        };
      }),
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
