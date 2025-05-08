import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router'; // Para redirigir a otras páginas
import { UsuariosService } from 'src/app/services/usuarios/usuarios.service';
import { UserBlockService } from 'src/app/services/usuarios/user-block.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {}; // Para almacenar los datos del usuario
  userData: any = {}; // Datos que se van a actualizar
  isEditing: boolean = false; // Para controlar el estado de edición
  isAdmin: boolean = false; // Para saber si el usuario es un admin
  valoracionMedia: number | null = null;
  totalValoraciones: number = 0;
  usuariosBloqueados: any[] = [];
  mostrarUsuariosBloqueados: boolean = false;

  constructor(
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private userBlockService: UserBlockService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadValoracionMedia();
    this.cargarUsuariosBloqueados();
  }

  // Cargar el perfil del usuario
  loadProfile() {
    this.authService.getProfile().subscribe(
      (data) => {
        this.user = data;
        this.userData = { ...this.user }; // Inicializamos los datos de edición con los datos actuales

        // Verificar si el usuario es un admin
        this.isAdmin = this.user.rol === 'admin';
      },
      (error) => {
        console.error('Error al obtener perfil', error);
      }
    );
  }

  loadValoracionMedia() {
    const token = localStorage.getItem('token');
    let userId: number | null = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.sub || payload.user_id || payload.id;
      } catch (e) {}
    }
    if (!userId) return;
    this.usuariosService.getUserValoraciones(userId).subscribe({
      next: (response: any) => {
        this.valoracionMedia = response.media_valoracion;
        this.totalValoraciones = response.total_valoraciones;
      },
      error: () => {
        this.valoracionMedia = null;
        this.totalValoraciones = 0;
      }
    });
  }

  // Activar el modo de edición
  enableEdit() {
    this.isEditing = true;
    this.userData = { ...this.user }; // Rellenamos el formulario con los datos actuales
  }

  // Cancelar la edición
  cancelEdit() {
    this.isEditing = false;
    this.userData = { ...this.user }; // Restaurar los valores originales
  }

  // Actualizar el perfil
  updateProfile() {
    this.authService.updateProfile(this.userData).subscribe(
      (data) => {
        this.user = data.user; // Actualizamos el perfil con los nuevos datos
        this.isEditing = false; // Desactivamos el modo de edición
        alert('Perfil actualizado con éxito. Verifica tu correo.');
      },
      (error) => {
        console.error('Error al actualizar el perfil', error);
        alert('Hubo un error al actualizar el perfil.');
      }
    );
  }

  // Redirigir al panel de administración
  goToAdminPanel() {
    this.router.navigate(['/admin']); // Asumiendo que tienes una ruta para el panel de administración
  }

  // Redirigir a la vista de mis vehículos
  goToMyVehicles() {
    this.router.navigate(['/mis-vehiculos']);
  }

  cargarUsuariosBloqueados(): void {
    this.userBlockService.obtenerUsuariosBloqueados().subscribe({
      next: (response) => {
        this.usuariosBloqueados = response.usuarios_bloqueados;
      },
      error: (error) => {
        console.error('Error al cargar usuarios bloqueados:', error);
        this.toastr.error('Error al cargar usuarios bloqueados');
      }
    });
  }

  desbloquearUsuario(usuarioId: number): void {
    this.userBlockService.desbloquearUsuario(usuarioId).subscribe({
      next: () => {
        this.usuariosBloqueados = this.usuariosBloqueados.filter(u => u.id !== usuarioId);
        this.toastr.success('Usuario desbloqueado exitosamente');
      },
      error: (error) => {
        this.toastr.error(error.error.message || 'Error al desbloquear usuario');
      }
    });
  }

  toggleUsuariosBloqueados(): void {
    this.mostrarUsuariosBloqueados = !this.mostrarUsuariosBloqueados;
  }
}
