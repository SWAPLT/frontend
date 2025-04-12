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
    kilometraje: number;
    transmision: string;
    tipo_combustible: string;
    imagen_url: string;
    estado: string;
    color: string;
    fuerza: number;
    capacidad_motor: number;
    numero_puertas: number;
    plazas: number;
    descripcion: string;
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
  animatingFavorites: Set<number> = new Set();

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
    
    // Suscribirse a cambios en los favoritos
    this.favoritosService.getFavoritosState().subscribe(favoritos => {
      this.favoritos = favoritos;
      this.totalItems = this.favoritos.length;
    });
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
        if (error.status === 404) {
          // Si no hay favoritos, mostramos la lista vacía
          this.favoritos = [];
          this.totalItems = 0;
          this.loading = false;
        } else {
          this.error = 'Error al cargar los favoritos. Por favor, intente nuevamente.';
          this.loading = false;
          console.error('Error loading favorites:', error);
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
            this.toastr.warning('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
          }
        }
      }
    });
  }

  removeFavorito(favoritoId: number): void {
    this.animatingFavorites.add(favoritoId);
    this.favoritosService.removeFavoritoById(favoritoId).subscribe({
      next: () => {
        setTimeout(() => {
          this.animatingFavorites.delete(favoritoId);
          this.toastr.success('Vehículo eliminado de favoritos');
        }, 2000);
      },
      error: (error) => {
        this.animatingFavorites.delete(favoritoId);
        if (error.status === 404) {
          // Si el favorito ya no existe, lo eliminamos de la lista local
          this.favoritos = this.favoritos.filter(f => f.id !== favoritoId);
          this.totalItems = this.favoritos.length;
          this.toastr.success('Vehículo eliminado de favoritos');
        } else {
          this.toastr.error('Error al eliminar de favoritos');
          console.error('Error removing favorite:', error);
        }
      }
    });
  }

  isAnimating(favoritoId: number): boolean {
    return this.animatingFavorites.has(favoritoId);
  }

  goToVehicleDetail(vehiculoId: number): void {
    this.router.navigate(['/vehiculo', vehiculoId]);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }
} 
