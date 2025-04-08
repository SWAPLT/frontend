import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.authService.getProfile().subscribe({
          next: (profile) => {
            // Redirigir al usuario a la ruta que quieras
            this.router.navigate(['/profile']);
          }
        });
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
