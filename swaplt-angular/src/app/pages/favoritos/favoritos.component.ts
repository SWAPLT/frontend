import { Component, OnInit } from '@angular/core';
import { FavoritosService } from '../../services/favoritos.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

interface Favorito {
  id: number;
  vehiculo: {
    id: number;
    marca: string;
    modelo: string;
    anio: number;
    precio: number;
    kilometros: number;
    combustible: string;
    imagen: string;
  };
}

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css']
})
export class FavoritosComponent implements OnInit {
  favoritos: Favorito[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;

  constructor(
    private favoritosService: FavoritosService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      this.toastr.warning('Por favor inicia sesión para ver tus favoritos');
      return;
    }
    this.loadFavoritos();
  }

  get paginatedFavoritos(): Favorito[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.favoritos.slice(startIndex, startIndex + this.itemsPerPage);
  }

  loadFavoritos(): void {
    this.loading = true;
    this.error = null;

    this.favoritosService.getFavoritos().subscribe({
      next: (response) => {
        this.favoritos = response;
        this.totalItems = this.favoritos.length;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los favoritos. Por favor, intente nuevamente.';
        this.loading = false;
        console.error('Error loading favorites:', error);
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
          this.toastr.warning('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        }
      }
    });
  }

  removeFavorito(favoritoId: number): void {
    this.favoritosService.removeFavorito(favoritoId).subscribe({
      next: () => {
        this.favoritos = this.favoritos.filter(f => f.id !== favoritoId);
        this.totalItems = this.favoritos.length;
        this.toastr.success('Vehículo eliminado de favoritos');
        
        // Ajustar la página actual si es necesario
        const maxPage = Math.ceil(this.totalItems / this.itemsPerPage);
        if (this.currentPage > maxPage && maxPage > 0) {
          this.currentPage = maxPage;
        }
      },
      error: (error) => {
        this.toastr.error('Error al eliminar de favoritos');
        console.error('Error removing favorite:', error);
      }
    });
  }

  goToVehicleDetail(vehiculoId: number): void {
    this.router.navigate(['/vehicle', vehiculoId]);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }
} 
