import { Component, OnInit, OnDestroy } from '@angular/core';
import { MensajeService } from '../../services/mensaje.service';
import { Mensaje } from '../../models/mensaje.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from 'src/app/models/usuario.model';
import { interval, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mensajes',
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.css']
})
export class MensajesComponent implements OnInit, OnDestroy {
  mensajes: Mensaje[] = [];
  nuevoMensaje: string = '';
  usuarioActual: Usuario | null = null;
  usuarioSeleccionado: Usuario | null = null;
  usuarios: Usuario[] = [];
  private actualizarMensajesSubscription?: Subscription;
  private ultimoMensajeId: number = 0;
  usuariosConConversacion: Set<number> = new Set();
  mostrarChat: boolean = false;

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

  ngOnDestroy(): void {
    if (this.actualizarMensajesSubscription) {
      this.actualizarMensajesSubscription.unsubscribe();
    }
  }

  cargarUsuariosConConversacion(): void {
    if (!this.usuarioActual) return;

    // Primero cargamos todos los usuarios
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        // Filtramos el usuario actual
        this.usuarios = usuarios.filter(u => u.id !== this.usuarioActual?.id);
        
        // Para cada usuario, verificamos si hay mensajes
        const promesas = this.usuarios.map(usuario => 
          new Promise<void>((resolve) => {
            this.mensajeService.getMensajes(this.usuarioActual!.id, usuario.id).subscribe({
              next: (mensajes: Mensaje[]) => {
                if (mensajes.length > 0) {
                  this.usuariosConConversacion.add(usuario.id);
                }
                resolve();
              },
              error: () => resolve()
            });
          })
        );

        // Esperamos a que todas las verificaciones terminen
        Promise.all(promesas).then(() => {
          // Actualizamos la lista de usuarios para mostrar solo los que tienen conversación
          this.usuarios = this.usuarios.filter(u => this.tieneConversacion(u.id));
        });
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.toastr.error('Error al cargar la lista de conversaciones');
      }
    });
  }

  seleccionarUsuario(usuarioId: number): void {
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    if (usuario) {
      this.usuarioSeleccionado = usuario;
      this.mostrarChat = true;
      this.cargarMensajes(usuarioId);
      this.iniciarActualizacionAutomatica(usuarioId);
    } else {
      // Si el usuario no está en la lista, obtener sus datos
      this.usuariosService.getUsuarioById(usuarioId).subscribe({
        next: (usuario: Usuario) => {
          this.usuarioSeleccionado = usuario;
          this.mostrarChat = true;
          if (!this.usuarios.find(u => u.id === usuario.id)) {
            this.usuarios.push(usuario);
          }
          this.cargarMensajes(usuarioId);
          this.iniciarActualizacionAutomatica(usuarioId);
        },
        error: (error: any) => {
          console.error('Error al cargar usuario:', error);
        }
      });
    }
  }

  iniciarActualizacionAutomatica(receptor_id: number): void {
    // Detener cualquier suscripción anterior
    if (this.actualizarMensajesSubscription) {
      this.actualizarMensajesSubscription.unsubscribe();
    }

    // Crear un nuevo intervalo que se ejecute cada 3 segundos
    this.actualizarMensajesSubscription = interval(3000).subscribe(() => {
      if (this.usuarioActual && this.usuarioSeleccionado) {
        this.mensajeService.getMensajes(this.usuarioActual.id, receptor_id)
          .subscribe(mensajes => {
            // Verificar si hay mensajes nuevos
            if (mensajes.length > this.mensajes.length) {
              const nuevos = mensajes.filter(m => !this.mensajes.find(existente => existente.id === m.id));
              if (nuevos.length > 0) {
                this.mensajes = mensajes;
                this.marcarMensajesComoLeidos();
                // Hacer scroll al último mensaje
                setTimeout(() => {
                  const container = document.querySelector('.messages-container');
                  if (container) {
                    container.scrollTop = container.scrollHeight;
                  }
                }, 100);
              }
            }
          });
      }
    });
  }

  cargarMensajes(receptor_id: number): void {
    if (this.usuarioActual) {
      this.mensajeService.getMensajes(this.usuarioActual.id, receptor_id)
        .subscribe(mensajes => {
          this.mensajes = mensajes;
          this.marcarMensajesComoLeidos();
          // Hacer scroll al último mensaje
          setTimeout(() => {
            const container = document.querySelector('.messages-container');
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          }, 100);
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
        .subscribe({
          next: (mensajeEnviado) => {
            // Agregar el usuario a la lista de conversaciones si no estaba
            if (!this.tieneConversacion(this.usuarioSeleccionado!.id)) {
              this.usuariosConConversacion.add(this.usuarioSeleccionado!.id);
            }
            // Cargar todos los mensajes nuevamente para asegurar la sincronización
            this.cargarMensajes(this.usuarioSeleccionado!.id);
            this.nuevoMensaje = '';
          },
          error: (error) => {
            console.error('Error al enviar mensaje:', error);
            this.toastr.error('Error al enviar el mensaje');
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

  volverALista(): void {
    this.usuarioSeleccionado = null;
    this.mostrarChat = false;
    this.router.navigate(['/mensajes']);
  }
} 