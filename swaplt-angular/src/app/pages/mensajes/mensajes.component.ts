import { Component, OnInit } from '@angular/core';
import { MensajeService } from '../../services/mensaje.service';
import { Mensaje } from '../../models/mensaje.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from 'src/app/models/usuario.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mensajes',
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.css']
})
export class MensajesComponent implements OnInit {
  mensajes: Mensaje[] = [];
  nuevoMensaje: string = '';
  usuarioActual: Usuario | null = null;
  usuarioSeleccionado: Usuario | null = null;
  usuarios: Usuario[] = [];
  usuariosConConversacion: Set<number> = new Set();

  constructor(
    private mensajeService: MensajeService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private usuariosService: UsuariosService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.getCurrentUser();
    if (this.usuarioActual) {
      this.cargarUsuariosConConversacion();
    }

    // Verificar si hay un usuarioId en la ruta
    this.route.params.subscribe(params => {
      if (params['usuarioId']) {
        const usuarioId = parseInt(params['usuarioId']);
        if (!isNaN(usuarioId)) {
          // Si el usuario no está en la lista, cargarlo primero
          if (!this.usuarios.find(u => u.id === usuarioId)) {
            this.usuariosService.getUsuarioById(usuarioId).subscribe({
              next: (usuario: Usuario) => {
                this.usuarios.push(usuario);
                this.seleccionarUsuario(usuarioId);
              },
              error: (error: any) => {
                console.error('Error al cargar usuario:', error);
                this.toastr.error('No se pudo cargar el usuario');
              }
            });
          } else {
            this.seleccionarUsuario(usuarioId);
          }
        }
      }
    });
  }

  cargarUsuariosConConversacion(): void {
    if (!this.usuarioActual) return;

    // Primero cargamos todos los usuarios
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        // Filtramos el usuario actual
        this.usuarios = usuarios.filter(u => u.id !== this.usuarioActual?.id);
        
        // Para cada usuario, verificamos si hay mensajes
        this.usuarios.forEach(usuario => {
          this.mensajeService.getMensajes(this.usuarioActual!.id, usuario.id).subscribe({
            next: (mensajes: Mensaje[]) => {
              if (mensajes.length > 0) {
                this.usuariosConConversacion.add(usuario.id);
              }
            }
          });
        });
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  seleccionarUsuario(usuarioId: number): void {
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    if (usuario) {
      this.usuarioSeleccionado = usuario;
      this.cargarMensajes(usuarioId);
    } else {
      // Si el usuario no está en la lista, obtener sus datos
      this.usuariosService.getUsuarioById(usuarioId).subscribe({
        next: (usuario: Usuario) => {
          this.usuarioSeleccionado = usuario;
          this.cargarMensajes(usuarioId);
        },
        error: (error: any) => {
          console.error('Error al cargar usuario:', error);
        }
      });
    }
  }

  cargarMensajes(receptor_id: number): void {
    if (this.usuarioActual) {
      this.mensajeService.getMensajes(this.usuarioActual.id, receptor_id)
        .subscribe(mensajes => {
          this.mensajes = mensajes;
          this.marcarMensajesComoLeidos();
        });
    }
  }

  enviarMensaje(): void {
    if (this.nuevoMensaje.trim() && this.usuarioSeleccionado && this.usuarioActual) {
      const mensaje: any = {
        emisor_id: this.usuarioActual.id,
        receptor_id: this.usuarioSeleccionado.id,
        contenido: this.nuevoMensaje
      };

      this.mensajeService.enviarMensaje(mensaje)
        .subscribe(mensaje => {
          this.mensajes.push(mensaje);
          this.nuevoMensaje = '';
          // Si el usuario no estaba en la lista, recargar la lista
          if (!this.usuarios.find(u => u.id === this.usuarioSeleccionado?.id)) {
            this.cargarUsuariosConConversacion();
          }
        });
    }
  }

  marcarMensajesComoLeidos(): void {
    if (this.usuarioActual) {
      this.mensajes.forEach(mensaje => {
        if (!mensaje.leido && mensaje.receptor_id === this.usuarioActual?.id) {
          this.mensajeService.marcarLeido(mensaje.id).subscribe();
        }
      });
    }
  }

  esMensajePropio(mensaje: Mensaje): boolean {
    return mensaje.emisor_id === this.usuarioActual?.id;
  }

  tieneConversacion(usuarioId: number): boolean {
    return this.usuariosConConversacion.has(usuarioId);
  }
} 