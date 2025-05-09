import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-google-callback',
  template: `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Procesando inicio de sesión...</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class GoogleCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.authService.handleGoogleCallback(token).subscribe({
          next: () => {
            this.toastr.success('¡Bienvenido a SWAPLT!');
            this.router.navigate(['/profile']);
          },
          error: (error) => {
            this.toastr.error('Error al procesar el inicio de sesión');
            this.router.navigate(['/login']);
          }
        });
      } else {
        this.toastr.error('Token no encontrado');
        this.router.navigate(['/login']);
      }
    });
  }
} 