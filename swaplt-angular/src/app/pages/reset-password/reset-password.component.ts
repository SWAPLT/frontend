import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  token: string = '';
  password: string = '';
  password_confirmation: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  resetPassword() {
    // Validación de campos vacíos
    if (!this.token || !this.password || !this.password_confirmation) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    // Validación de contraseñas
    if (this.password !== this.password_confirmation) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    // Validación de longitud mínima de contraseña
    if (this.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resetPassword(this.token, this.password, this.password_confirmation).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = '¡Contraseña restablecida con éxito! Serás redirigido al inicio de sesión.';
        this.toastr.success('¡Contraseña restablecida con éxito!');
        
        // Limpiar el formulario
        this.token = '';
        this.password = '';
        this.password_confirmation = '';

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 422) {
          if (err.error.errors?.token) {
            this.errorMessage = 'El token de restablecimiento no es válido o ha expirado';
          } else if (err.error.errors?.password) {
            this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
          } else {
            this.errorMessage = 'Por favor, verifica que los datos ingresados sean correctos';
          }
        } else if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet';
        } else {
          this.errorMessage = 'Ocurrió un error al restablecer la contraseña. Por favor, intenta nuevamente';
        }
        console.error('Reset password error:', err);
      }
    });
  }
} 