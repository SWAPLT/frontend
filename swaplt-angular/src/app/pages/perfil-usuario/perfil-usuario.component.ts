import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { UserBlockService } from '../../services/usuarios/user-block.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.css']
})
export class PerfilUsuarioComponent implements OnInit {
  usuario: any = null;
  vehiculos: any[] = [];
  loading = true;
  error = false;
  valoracionMedia: number | null = null;
  totalValoraciones: number = 0;
  puedeValorar: boolean = false;
  yaValorado: boolean = false;
  valoracionEnviada: boolean = false;
  valoracionError: string | null = null;
  valorSeleccionado: number = 5;
  comentario: string = '';
  userId: number | null = null;
  usuarioLogueadoId: number | null = null;
  valoraciones: any[] = [];
  estaBloqueado: boolean = false;
  meHaBloqueado: boolean = false;
  razonBloqueo: string = '';

  constructor(
    private route: ActivatedRoute,
    private usuariosService: UsuariosService,
    private userBlockService: UserBlockService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    this.userId = userId ? parseInt(userId) : null;
    if (this.userId) {
      this.loadUserProfile(this.userId);
      this.loadUserValoraciones(this.userId);
      this.checkPuedeValorar();
      this.verificarEstadoBloqueo();
    }
  }

  loadUserProfile(userId: number): void {
    this.loading = true;
    this.usuariosService.getUserVehiclesById(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.usuario = response.data.usuario;
          this.vehiculos = response.data.vehiculos;
        } else {
          this.error = true;
          this.toastr.error(response.message, 'Error');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.error = true;
        this.loading = false;
        this.toastr.error('Error al cargar el perfil del usuario', 'Error');
      }
    });
  }

  loadUserValoraciones(userId: number): void {
    this.usuariosService.getUserValoraciones(userId).subscribe({
      next: (response: any) => {
        this.valoracionMedia = response.media_valoracion;
        this.totalValoraciones = response.total_valoraciones;
        this.valoraciones = response.valoraciones || [];
      },
      error: (error) => {
        this.valoracionMedia = null;
        this.totalValoraciones = 0;
        this.valoraciones = [];
      }
    });
  }

  checkPuedeValorar(): void {
    // Obtener el id del usuario logueado (puedes adaptar esto según tu authService)
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.usuarioLogueadoId = payload.sub || payload.user_id || payload.id;
    } catch (e) { return; }
    if (!this.usuarioLogueadoId || !this.userId || this.usuarioLogueadoId === this.userId) return;
    this.usuariosService.getUserValoraciones(this.userId).subscribe({
      next: (response: any) => {
        this.yaValorado = response.valoraciones.some((v: any) => v.emisor_id === this.usuarioLogueadoId);
        // Si ya ha valorado, no puede valorar de nuevo
        this.puedeValorar = !this.yaValorado;
      },
      error: () => {
        this.puedeValorar = false;
      }
    });
  }

  enviarValoracion(): void {
    if (!this.userId) return;
    this.valoracionError = null;
    this.usuariosService.enviarValoracion({
      receptor_id: this.userId,
      valor: this.valorSeleccionado,
      comentario: this.comentario
    }).subscribe({
      next: () => {
        this.valoracionEnviada = true;
        this.puedeValorar = false;
        this.yaValorado = true;
        this.loadUserValoraciones(this.userId!);
      },
      error: (err) => {
        this.valoracionError = err?.error?.message || 'Error al enviar la valoración';
      }
    });
  }

  verificarEstadoBloqueo(): void {
    if (!this.userId) return;
    this.userBlockService.verificarBloqueo(this.userId).subscribe({
      next: (response) => {
        this.estaBloqueado = response.yo_lo_he_bloqueado;
        this.meHaBloqueado = response.el_me_ha_bloqueado;
      },
      error: (error) => {
        console.error('Error al verificar estado de bloqueo:', error);
      }
    });
  }

  bloquearUsuario(): void {
    if (!this.userId) return;
    this.userBlockService.bloquearUsuario(this.userId, this.razonBloqueo).subscribe({
      next: () => {
        this.estaBloqueado = true;
        this.toastr.success('Usuario bloqueado exitosamente');
        this.razonBloqueo = '';
      },
      error: (error) => {
        this.toastr.error(error.error.message || 'Error al bloquear usuario');
      }
    });
  }

  desbloquearUsuario(): void {
    if (!this.userId) return;
    this.userBlockService.desbloquearUsuario(this.userId).subscribe({
      next: () => {
        this.estaBloqueado = false;
        this.toastr.success('Usuario desbloqueado exitosamente');
      },
      error: (error) => {
        this.toastr.error(error.error.message || 'Error al desbloquear usuario');
      }
    });
  }
} 