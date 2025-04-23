import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehiculoReporteService {
  private apiUrl = `${environment.apiUrl}/vehiculos/reporte`;

  constructor(private http: HttpClient) { }

  generarReporte(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/pdf'
      })
    });
  }
} 