import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  resetPassword() {
    if (!this.token) {
      this.errorMessage = 'Por favor, ingresa el token';
      return;
    }

    if (this.password !== this.password_confirmation) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.authService.resetPassword(this.token, this.password, this.password_confirmation).subscribe({
      next: (response) => {
        this.successMessage = 'Contraseña restablecida con éxito';
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error.error || 'Error al restablecer la contraseña';
        this.successMessage = '';
      }
    });
  }
} 