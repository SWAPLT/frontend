import { Component, OnInit, OnDestroy } from '@angular/core';
import { MensajeService } from '../../services/mensaje.service';
import { Mensaje } from '../../models/mensaje.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '../../services/user/usuarios.service';
import { Usuario } from 'src/app/models/usuario.model';
import { interval, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UserBlockService } from '../../services/usuarios/user-block.service';

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
  menuContextual = {
    mostrar: false,
    x: 0,
    y: 0,
    mensaje: null as Mensaje | null
  };
  mensajesNoLeidos: Map<number, number> = new Map(); // userId -> cantidad de mensajes no leídos
  usuariosBloqueados: number[] = []; // Lista de IDs de usuarios bloqueados
  usuariosQueMeBloquearon: number[] = []; // Lista de IDs de usuarios que me bloquearon

  constructor(
    private mensajeService: MensajeService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private usuariosService: UsuariosService,
    private toastr: ToastrService,
    private userBlockService: UserBlockService
  ) {
    // Cerrar el menú contextual al hacer clic fuera
    document.addEventListener('click', () => {
      this.menuContextual.mostrar = false;
    });
  }

  ngOnInit(): void {
    this.usuarioActual = this.authService.getCurrentUser();
    if (this.usuarioActual) {
      this.cargarBloqueos();
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
    // Eliminar el event listener al destruir el componente
    document.removeEventListener('click', () => {
      this.menuContextual.mostrar = false;
    });
  }

  /**
   * Carga la información de usuarios bloqueados y que han bloqueado al usuario actual
   */
  cargarBloqueos(): void {
    // Cargar usuarios bloqueados por el usuario actual
    this.userBlockService.obtenerUsuariosBloqueados().subscribe({
      next: (response) => {
        this.usuariosBloqueados = response.usuarios_bloqueados.map((usuario: any) => usuario.id);
        this.cargarUsuariosConConversacion();
      },
      error: (error) => {
        console.error('Error al cargar usuarios bloqueados:', error);
        this.cargarUsuariosConConversacion(); // Intentar cargar usuarios de todas formas
      }
    });

    // Cargar usuarios que han bloqueado al usuario actual
    this.userBlockService.obtenerUsuariosQueMeBloquearon().subscribe({
      next: (response) => {
        this.usuariosQueMeBloquearon = response.usuarios_que_me_bloquearon.map((usuario: any) => usuario.id);
      },
      error: (error) => {
        console.error('Error al cargar usuarios que me bloquearon:', error);
      }
    });
  }

  cargarUsuariosConConversacion(): void {
    if (!this.usuarioActual) return;

    // Primero cargamos todos los usuarios
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        // Filtramos el usuario actual y los usuarios bloqueados o que nos han bloqueado
        this.usuarios = usuarios.filter(u => 
          u.id !== this.usuarioActual?.id && 
          !this.usuariosBloqueados.includes(u.id) && 
          !this.usuariosQueMeBloquearon.includes(u.id)
        );
        
        // Para cada usuario, verificamos si hay mensajes
        const promesas = this.usuarios.map(usuario => 
          new Promise<void>((resolve) => {
            this.mensajeService.getMensajes(this.usuarioActual!.id, usuario.id).subscribe({
              next: (mensajes: Mensaje[]) => {
                if (mensajes.length > 0) {
                  this.usuariosConConversacion.add(usuario.id);
                  // Contar mensajes no leídos
                  const noLeidos = mensajes.filter(m => 
                    !m.leido && m.receptor_id === this.usuarioActual?.id
                  ).length;
                  if (noLeidos > 0) {
                    this.mensajesNoLeidos.set(usuario.id, noLeidos);
                  }
                }
                resolve();
              },
              error: (error) => {
                console.error(`Error al cargar mensajes con usuario ${usuario.id}:`, error);
                resolve();
              }
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
    // Verificar si el usuario está bloqueado o nos ha bloqueado
    if (this.usuariosBloqueados.includes(usuarioId) || this.usuariosQueMeBloquearon.includes(usuarioId)) {
      this.toastr.error('No puedes enviar mensajes a este usuario');
      return;
    }

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
          // Verificar nuevamente si el usuario está bloqueado o nos ha bloqueado
          if (this.usuariosBloqueados.includes(usuario.id) || this.usuariosQueMeBloquearon.includes(usuario.id)) {
            this.toastr.error('No puedes enviar mensajes a este usuario');
            return;
          }
          
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
          this.toastr.error('No se pudo cargar el usuario');
        }
      });
    }
  }

  iniciarActualizacionAutomatica(usuarioId: number): void {
    // Cancelar cualquier suscripción previa
    if (this.actualizarMensajesSubscription) {
      this.actualizarMensajesSubscription.unsubscribe();
    }

    this.actualizarMensajesSubscription = interval(5000).subscribe(() => {
      // Verificar si el usuario está bloqueado o nos ha bloqueado
      if (this.usuariosBloqueados.includes(usuarioId) || 
          this.usuariosQueMeBloquearon.includes(usuarioId)) {
        // Si hay un bloqueo, detener la actualización automática
        if (this.actualizarMensajesSubscription) {
          this.actualizarMensajesSubscription.unsubscribe();
        }
        this.toastr.error('No puedes ver mensajes de este usuario');
        this.volverALista();
        return;
      }

      // Verificar si tenemos un usuario actual y seleccionado
      if (this.usuarioActual && this.usuarioSeleccionado && this.usuarioSeleccionado.id === usuarioId) {
        this.mensajeService.getMensajes(this.usuarioActual.id, usuarioId).subscribe({
          next: (mensajes: Mensaje[]) => {
            // Verificar si hay mensajes nuevos
            if (mensajes.length > 0 && this.ultimoMensajeId < Math.max(...mensajes.map(m => m.id))) {
              this.mensajes = mensajes;
              
              // Marcar los mensajes nuevos como leídos
              const mensajesNoLeidos = mensajes.filter(
                m => !m.leido && m.receptor_id === this.usuarioActual?.id
              );
              
              mensajesNoLeidos.forEach(m => {
                this.mensajeService.marcarLeido(m.id).subscribe();
              });
              
              // Actualizar el id del último mensaje
              this.ultimoMensajeId = Math.max(...mensajes.map(m => m.id));
            }
          },
          error: (error) => {
            console.error('Error al actualizar mensajes:', error);
            
            // Si recibimos un 403, puede ser porque hay un bloqueo
            if (error.status === 403) {
              // Detener actualizaciones y volver a la lista
              if (this.actualizarMensajesSubscription) {
                this.actualizarMensajesSubscription.unsubscribe();
              }
              this.cargarBloqueos(); // Actualizar la información de bloqueos
              this.toastr.error('No puedes ver mensajes de este usuario');
              this.volverALista();
            }
          }
        });
      }
    });
  }

  cargarMensajes(usuarioId: number): void {
    if (!this.usuarioActual) return;
    
    // Verificar si el usuario está bloqueado o nos ha bloqueado
    if (this.usuariosBloqueados.includes(usuarioId) || this.usuariosQueMeBloquearon.includes(usuarioId)) {
      this.mensajes = [];
      this.toastr.error('No puedes ver mensajes de este usuario');
      return;
    }

    this.mensajeService.getMensajes(this.usuarioActual.id, usuarioId)
      .subscribe({
        next: (mensajes: Mensaje[]) => {
          this.mensajes = mensajes;
          
          // Marcar mensajes como leídos
          const mensajesNoLeidos = mensajes.filter(
            m => !m.leido && m.receptor_id === this.usuarioActual?.id
          );
          
          mensajesNoLeidos.forEach(m => {
            this.mensajeService.marcarLeido(m.id).subscribe();
          });
          
          // Actualizar contador de mensajes no leídos
          if (mensajesNoLeidos.length > 0 && this.usuarioSeleccionado) {
            this.mensajesNoLeidos.set(this.usuarioSeleccionado.id, 0);
          }
          
          // Actualizar el id del último mensaje para futuras actualizaciones
          if (mensajes.length > 0) {
            this.ultimoMensajeId = Math.max(...mensajes.map(m => m.id));
          }
        },
        error: (error) => {
          console.error('Error al cargar mensajes:', error);
          
          // Si recibimos un 403, puede ser porque hay un bloqueo
          if (error.status === 403) {
            this.cargarBloqueos(); // Actualizar la información de bloqueos
            this.toastr.error('No puedes ver mensajes de este usuario');
            this.volverALista();
          } else {
            this.toastr.error('Error al cargar los mensajes');
          }
        }
      });
  }

  ordenarUsuariosPorUltimoMensaje(): void {
    // Crear un mapa para almacenar la fecha del último mensaje de cada usuario
    const ultimosMensajes = new Map<number, Date>();
    
    // Obtener la fecha del último mensaje para el usuario actual
    if (this.usuarioSeleccionado && this.mensajes.length > 0) {
      const ultimoMensaje = this.mensajes[this.mensajes.length - 1];
      ultimosMensajes.set(this.usuarioSeleccionado.id, new Date(ultimoMensaje.created_at));
    }
    
    // Ordenar la lista de usuarios
    this.usuarios.sort((a, b) => {
      const fechaA = ultimosMensajes.get(a.id) || new Date(0);
      const fechaB = ultimosMensajes.get(b.id) || new Date(0);
      return fechaB.getTime() - fechaA.getTime();
    });
  }

  enviarMensaje(): void {
    if (this.nuevoMensaje.trim() && this.usuarioSeleccionado && this.usuarioActual) {
      // Verificar si el usuario está bloqueado o nos ha bloqueado
      if (this.usuariosBloqueados.includes(this.usuarioSeleccionado.id) || 
          this.usuariosQueMeBloquearon.includes(this.usuarioSeleccionado.id)) {
        this.toastr.error('No puedes enviar mensajes a este usuario');
        return;
      }

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
              
              // Si el usuario no está en la lista de usuarios, lo agregamos
              if (!this.usuarios.find(u => u.id === this.usuarioSeleccionado!.id)) {
                this.usuarios.push(this.usuarioSeleccionado!);
              }
            }
            
            // Cargar todos los mensajes nuevamente para asegurar la sincronización
            this.cargarMensajes(this.usuarioSeleccionado!.id);
            this.nuevoMensaje = '';
          },
          error: (error) => {
            console.error('Error al enviar mensaje:', error);
            
            // Si recibimos un 403, puede ser porque hay un bloqueo
            if (error.status === 403) {
              this.cargarBloqueos(); // Actualizar la información de bloqueos
              this.toastr.error('No puedes enviar mensajes a este usuario');
            } else {
              this.toastr.error('Error al enviar el mensaje');
            }
          }
        });
    }
  }

  marcarMensajesComoLeidos(): void {
    if (this.usuarioActual && this.usuarioSeleccionado) {
      const mensajesNoLeidos = this.mensajes.filter(mensaje => 
        !mensaje.leido && mensaje.receptor_id === this.usuarioActual?.id
      );

      mensajesNoLeidos.forEach(mensaje => {
        this.mensajeService.marcarLeido(mensaje.id).subscribe(() => {
          mensaje.leido = true;
        });
      });

      // Limpiar el contador de mensajes no leídos para este usuario
      this.mensajesNoLeidos.delete(this.usuarioSeleccionado.id);
    }
  }

  esMensajePropio(mensaje: Mensaje): boolean {
    return mensaje.emisor_id === this.usuarioActual?.id;
  }

  tieneConversacion(usuarioId: number): boolean {
    // No mostrar usuarios bloqueados o que nos han bloqueado
    if (this.usuariosBloqueados.includes(usuarioId) || this.usuariosQueMeBloquearon.includes(usuarioId)) {
      return false;
    }
    return this.usuariosConConversacion.has(usuarioId);
  }

  tieneMensajesNoLeidos(usuarioId: number): boolean {
    // No mostrar indicador de mensajes no leídos para usuarios bloqueados
    if (this.usuariosBloqueados.includes(usuarioId) || this.usuariosQueMeBloquearon.includes(usuarioId)) {
      return false;
    }
    return (this.mensajesNoLeidos.get(usuarioId) || 0) > 0;
  }

  volverALista(): void {
    this.usuarioSeleccionado = null;
    this.mostrarChat = false;
    this.router.navigate(['/mensajes']);
  }

  mostrarMenuContextual(event: MouseEvent, mensaje: Mensaje): void {
    event.preventDefault();
    
    // No mostrar el menú contextual si el usuario está bloqueado
    if (this.usuarioSeleccionado && (
      this.usuariosBloqueados.includes(this.usuarioSeleccionado.id) || 
      this.usuariosQueMeBloquearon.includes(this.usuarioSeleccionado.id)
    )) {
      return;
    }
    
    this.menuContextual = {
      mostrar: true,
      x: event.clientX,
      y: event.clientY,
      mensaje: mensaje
    };
  }

  eliminarMensaje(mensaje: Mensaje | null): void {
    if (!mensaje) return;

    this.mensajeService.eliminarMensaje(mensaje.id).subscribe({
      next: () => {
        // Eliminar el mensaje de la lista local
        this.mensajes = this.mensajes.filter(m => m.id !== mensaje.id);
        this.menuContextual.mostrar = false;
        this.toastr.success('Mensaje eliminado');

        // Si no quedan mensajes con este usuario, actualizar la lista de conversaciones
        const tieneOtrosMensajes = this.mensajes.some(m => 
          (m.emisor_id === this.usuarioSeleccionado?.id && m.receptor_id === this.usuarioActual?.id) ||
          (m.emisor_id === this.usuarioActual?.id && m.receptor_id === this.usuarioSeleccionado?.id)
        );

        if (!tieneOtrosMensajes && this.usuarioSeleccionado) {
          this.usuariosConConversacion.delete(this.usuarioSeleccionado.id);
          this.usuarios = this.usuarios.filter(u => this.tieneConversacion(u.id));
          if (this.usuarios.length === 0) {
            this.volverALista();
          }
        }
      },
      error: (error) => {
        console.error('Error al eliminar mensaje:', error);
        this.toastr.error('Error al eliminar el mensaje');
      }
    });
  }
} 