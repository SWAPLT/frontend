import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router'; // Para redirigir a otras páginas

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

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
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
}
