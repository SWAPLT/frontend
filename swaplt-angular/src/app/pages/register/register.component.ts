import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  password_confirmation = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService
  ) {}

  register() {
    // Validación de campos vacíos
    if (!this.name || !this.email || !this.password || !this.password_confirmation) {
      this.errorMessage = 'Por favor, completa todos los campos';
      this.toastr.warning('Por favor, completa todos los campos');
      return;
    }

    // Validación de contraseñas
    if (this.password !== this.password_confirmation) {
      this.errorMessage = 'Las contraseñas no coinciden';
      this.toastr.warning('Las contraseñas no coinciden');
      return;
    }

    // Validación de longitud mínima de contraseña
    if (this.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
      this.toastr.warning('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.name, this.email, this.password, this.password_confirmation).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = '¡Registro exitoso! Por favor, verifica tu correo electrónico para activar tu cuenta.';
        this.toastr.success('¡Registro exitoso! Por favor, verifica tu correo electrónico.');
        
        // Limpiar el formulario
        this.name = '';
        this.email = '';
        this.password = '';
        this.password_confirmation = '';

        // Redirigir al login después de 5 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 422) {
          if (err.error.errors?.email) {
            this.errorMessage = 'El correo electrónico ya está registrado';
            this.toastr.error('El correo electrónico ya está registrado');
          } else if (err.error.errors?.password) {
            this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
            this.toastr.error('La contraseña debe tener al menos 8 caracteres');
          } else {
            this.errorMessage = 'Por favor, verifica que los datos ingresados sean correctos';
            this.toastr.error('Por favor, verifica que los datos ingresados sean correctos');
          }
        } else if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet';
          this.toastr.error('No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet');
        } else {
          this.errorMessage = 'Ocurrió un error al registrarse. Por favor, intenta nuevamente';
          this.toastr.error('Ocurrió un error al registrarse. Por favor, intenta nuevamente');
        }
        console.error('Register error:', err);
      }
    });
  }
}
