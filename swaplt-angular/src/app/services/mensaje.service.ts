import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mensaje, MensajeCreate } from '../models/mensaje.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {
  private apiUrl = `${environment.apiUrl}/mensajes`;

  constructor(private http: HttpClient) { }

  // Enviar un mensaje
  enviarMensaje(mensaje: MensajeCreate): Observable<Mensaje> {
    return this.http.post<Mensaje>(this.apiUrl, mensaje);
  }

  // Obtener mensajes entre dos usuarios
  getMensajes(emisor_id: number, receptor_id: number): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.apiUrl}/${emisor_id}/${receptor_id}`);
  }

  // Marcar mensaje como leído
  marcarLeido(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/leido`, {});
  }

  // Eliminar un mensaje
  eliminarMensaje(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 