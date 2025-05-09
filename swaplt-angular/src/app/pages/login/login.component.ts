import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      this.toastr.warning('Por favor, completa todos los campos');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.authService.getProfile().subscribe({
          next: (profile) => {
            this.isLoading = false;
            this.toastr.success('¡Bienvenido a SWAPLT!');
            this.router.navigate(['/profile']);
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = 'Error al cargar el perfil. Por favor, intenta nuevamente.';
            this.toastr.error('Error al cargar el perfil. Por favor, intenta nuevamente.');
            console.error('Error loading profile:', err);
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.';
          this.toastr.error('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
        } else if (err.status === 422) {
          this.errorMessage = 'Por favor, verifica que los datos ingresados sean correctos.';
          this.toastr.error('Por favor, verifica que los datos ingresados sean correctos.');
        } else if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.';
          this.toastr.error('No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.');
        } else {
          this.errorMessage = 'Ocurrió un error al iniciar sesión. Por favor, intenta nuevamente.';
          this.toastr.error('Ocurrió un error al iniciar sesión. Por favor, intenta nuevamente.');
        }
        console.error('Login error:', err);
      }
    });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }
}
