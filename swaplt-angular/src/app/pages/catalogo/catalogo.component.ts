import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { VehiculosService } from './services/vehiculos.service';
import { ToastrService } from 'ngx-toastr';
import { FavoritosService } from '../../services/favoritos.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, catchError, of, finalize } from 'rxjs';
import { VehiculoImagenService } from '../../services/vehiculo-imagen.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit {
  vehiculos: any[] = [];
  vehiculosFiltrados: any[] = [];
  loading = true;
  loadingImages = false;
  error = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  searchForm: FormGroup;
  filtersForm: FormGroup;
  favoritos: number[] = [];
  animatingVehicles: Set<number> = new Set();
  imagenesCache: Map<number, SafeUrl> = new Map();

  constructor(
    private vehiculosService: VehiculosService,
    private vehiculoImagenService: VehiculoImagenService,
    private favoritosService: FavoritosService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.searchForm = this.fb.group({
      query: ['']
    });

    this.filtersForm = this.fb.group({
      marca: [''],
      modelo: [''],
      year: [''],
      precioMin: [''],
      precioMax: ['']
    });
  }

  ngOnInit(): void {
    console.log('Inicializando componente de catálogo...');
    
    // Suscribirse a los cambios de la ruta para detectar cambios en la página
    this.route.params.subscribe(params => {
      const page = params['page'];
      if (page) {
        this.currentPage = parseInt(page);
      } else {
        this.currentPage = 1;
      }
      this.loadVehiculos();
    });

    if (this.authService.isAuthenticated()) {
      this.loadFavoritos();
      this.favoritosService.getFavoritosState().subscribe(favoritos => {
        this.favoritos = favoritos.map(fav => fav.vehiculo_id);
      });
    }
  }

  get paginatedVehiculos(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.vehiculosFiltrados.slice(startIndex, startIndex + this.itemsPerPage);
  }

  loadVehiculos(): void {
    this.loading = true;
    this.vehiculosService.getVehiculos(this.currentPage)
      .subscribe({
        next: (response: any) => {
          this.vehiculos = response.data;
          this.vehiculosFiltrados = [...this.vehiculos];
          this.totalItems = response.total;
          this.loading = false;
          this.loadVehiculosImagenes();
        },
        error: (error: any) => {
          console.error('Error al cargar vehículos:', error);
          this.error = true;
          this.loading = false;
          this.toastr.error('Error al cargar los vehículos', 'Error');
        }
      });
  }

  loadVehiculosImagenes(): void {
    if (this.loadingImages) return;
    
    this.loadingImages = true;
    let completedRequests = 0;
    const totalVehiculos = this.vehiculos.length;

    this.vehiculos.forEach(vehiculo => {
      if (!this.imagenesCache.has(vehiculo.id)) {
        this.vehiculoImagenService.getPrimeraImagen(vehiculo.id)
          .pipe(
            catchError(() => of(null)),
            finalize(() => {
              completedRequests++;
              if (completedRequests === totalVehiculos) {
                this.loadingImages = false;
              }
            })
          )
          .subscribe(blob => {
            if (blob) {
              const imageUrl = URL.createObjectURL(blob);
              const safeUrl = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
              this.imagenesCache.set(vehiculo.id, safeUrl);
            }
          });
      } else {
        completedRequests++;
        if (completedRequests === totalVehiculos) {
          this.loadingImages = false;
        }
      }
    });
  }

  getVehiculoImagen(vehiculoId: number): SafeUrl | null {
    return this.imagenesCache.get(vehiculoId) || null;
  }

  onSearch(): void {
    const query = this.searchForm.get('query')?.value.toLowerCase();
    if (query) {
      this.vehiculosFiltrados = this.vehiculos.filter(vehiculo => 
        vehiculo.marca.toLowerCase().includes(query) ||
        vehiculo.modelo.toLowerCase().includes(query) ||
        vehiculo.anio.toString().includes(query)
      );
    } else {
      this.vehiculosFiltrados = [...this.vehiculos];
    }
    this.totalItems = this.vehiculosFiltrados.length;
    this.currentPage = 1;
    this.loadVehiculosImagenes();
  }

  onFilter(): void {
    const filters = this.filtersForm.value;
    this.vehiculosFiltrados = this.vehiculos.filter(vehiculo => {
      let cumpleFiltros = true;
      
      if (filters.marca && !vehiculo.marca.toLowerCase().includes(filters.marca.toLowerCase())) {
        cumpleFiltros = false;
      }
      if (filters.modelo && !vehiculo.modelo.toLowerCase().includes(filters.modelo.toLowerCase())) {
        cumpleFiltros = false;
      }
      if (filters.year && vehiculo.anio !== parseInt(filters.year)) {
        cumpleFiltros = false;
      }
      if (filters.precioMin && vehiculo.precio < parseInt(filters.precioMin)) {
        cumpleFiltros = false;
      }
      if (filters.precioMax && vehiculo.precio > parseInt(filters.precioMax)) {
        cumpleFiltros = false;
      }
      
      return cumpleFiltros;
    });
    
    this.totalItems = this.vehiculosFiltrados.length;
    this.currentPage = 1;
    this.loadVehiculosImagenes();
  }

  onPageChange(page: number): void {
    this.router.navigate(['/catalogo/pagina', page]);
  }

  loadFavoritos(): void {
    this.favoritosService.getFavoritos().pipe(
      catchError((error: any) => {
        if (error.status === 404) {
          console.log('No hay vehículos en favoritos');
          return of([]);
        }
        console.error('Error loading favorites:', error);
        this.toastr.error('Error al cargar los favoritos');
        return of([]);
      })
    ).subscribe((response: any[]) => {
      this.favoritos = response.map((fav: any) => fav.vehiculo_id);
    });
  }

  toggleFavorito(vehiculoId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      this.toastr.warning('Por favor inicia sesión para agregar a favoritos');
      return;
    }

    if (this.isFavorito(vehiculoId)) {
      this.animatingVehicles.add(vehiculoId);
      this.favoritosService.removeFavorito(vehiculoId).pipe(
        catchError((error: any) => {
          console.error('Error removing favorite:', error);
          this.animatingVehicles.delete(vehiculoId);
          if (error.message === 'Favorito no encontrado') {
            this.favoritos = this.favoritos.filter(id => id !== vehiculoId);
            this.toastr.success('Vehículo eliminado de favoritos');
          } else {
            this.toastr.error('Error al eliminar de favoritos');
          }
          return of(null);
        })
      ).subscribe(() => {
        setTimeout(() => {
          this.animatingVehicles.delete(vehiculoId);
        }, 1000);
        this.toastr.success('Vehículo eliminado de favoritos');
      });
    } else {
      this.favoritosService.addFavorito(vehiculoId).pipe(
        catchError((error: any) => {
          console.error('Error adding favorite:', error);
          this.toastr.error('Error al agregar a favoritos');
          return of(null);
        })
      ).subscribe(() => {
        this.toastr.success('Vehículo agregado a favoritos');
      });
    }
  }

  isFavorito(vehiculoId: number): boolean {
    return this.favoritos.includes(vehiculoId);
  }

  isAnimating(vehiculoId: number): boolean {
    return this.animatingVehicles.has(vehiculoId);
  }

  contactar(vehiculo: any): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      this.toastr.warning('Por favor inicia sesión para contactar al vendedor');
      return;
    }

    if (!vehiculo || !vehiculo.user_id) {
      this.toastr.error('No se pudo obtener la información del vendedor');
      return;
    }

    console.log('Redirigiendo al chat con el usuario:', vehiculo.user_id);
    this.router.navigate(['/mensajes', vehiculo.user_id]);
    this.toastr.success('Redirigiendo al chat con el vendedor');
  }

  verDetalles(id: number): void {
    if (id) {
      window.open(`/vehiculo/${id}`, '_blank');
    }
  }
}
