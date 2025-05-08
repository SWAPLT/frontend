import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserBlockService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) { }

  bloquearUsuario(usuarioId: number, razon?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${usuarioId}/bloquear`, { razon });
  }

  desbloquearUsuario(usuarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${usuarioId}/desbloquear`, {});
  }

  obtenerUsuariosBloqueados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/bloqueados`);
  }

  obtenerUsuariosQueMeBloquearon(): Observable<any> {
    return this.http.get(`${this.apiUrl}/que-me-bloquearon`);
  }

  verificarBloqueo(usuarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${usuarioId}/verificar-bloqueo`);
  }

  obtenerTodosLosBloqueos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/bloqueos-todos`);
  }

  desbloquearComoAdmin(blockerId: number, blockedId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/desbloquear-admin`, {
      usuario_bloqueante_id: blockerId,
      usuario_bloqueado_id: blockedId
    });
  }
} 