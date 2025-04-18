import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  requestReset() {
    if (!this.email) {
      this.errorMessage = 'Por favor, ingresa tu correo electrónico';
      return;
    }

    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response) => {
        this.successMessage = 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña';
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/reset-password']);
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = err.error.error || 'Error al solicitar el restablecimiento de contraseña';
        this.successMessage = '';
      }
    });
  }
} 