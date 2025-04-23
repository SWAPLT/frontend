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
  loading = true;
  loadingImages = false;
  error = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  searchForm: FormGroup;
  filterForm: FormGroup;
  favoritos: number[] = [];
  animatingVehicles: Set<number> = new Set();
  imagenesCache: Map<number, SafeUrl> = new Map();
  showFilters = false;

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

    this.filterForm = this.fb.group({
      precio_min: [''],
      precio_max: [''],
      anio_min: [''],
      anio_max: [''],
      kilometraje_max: [''],
      estado: [''],
      transmision: [''],
      tipo_combustible: [''],
      marca: [''],
      modelo: [''],
      color: [''],
      ubicacion: [''],
      numero_puertas: [''],
      vehiculo_libre_accidentes: ['']
    });
  }

  ngOnInit(): void {
    console.log('Inicializando componente de catálogo...');
    
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

  loadVehiculos(): void {
    this.loading = true;
    this.vehiculosService.getVehiculos(this.currentPage)
      .subscribe({
        next: (response: any) => {
          this.vehiculos = Array.isArray(response.data) ? response.data : [];
          this.totalItems = response.total || 0;
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
    if (this.loadingImages || !Array.isArray(this.vehiculos)) return;
    
    this.loadingImages = true;
    let completedRequests = 0;
    const totalVehiculos = this.vehiculos.length;

    this.vehiculos.forEach(vehiculo => {
      if (!this.imagenesCache.has(vehiculo.id)) {
        this.vehiculoImagenService.getPrimeraImagen(vehiculo.id)
          .pipe(
            catchError(() => {
              const defaultImage = '/assets/imgs/no-imagen.jpeg';
              const safeUrl = this.sanitizer.bypassSecurityTrustUrl(defaultImage);
              this.imagenesCache.set(vehiculo.id, safeUrl);
              return of(null);
            }),
            finalize(() => {
              completedRequests++;
              if (completedRequests === totalVehiculos) {
                this.loadingImages = false;
              }
            })
          )
          .subscribe(blob => {
            if (blob) {
              try {
                const imageUrl = URL.createObjectURL(blob);
                const safeUrl = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
                this.imagenesCache.set(vehiculo.id, safeUrl);
              } catch (error) {
                console.error('Error al procesar la imagen:', error);
                const defaultImage = '/assets/imgs/no-imagen.jpeg';
                const safeUrl = this.sanitizer.bypassSecurityTrustUrl(defaultImage);
                this.imagenesCache.set(vehiculo.id, safeUrl);
              }
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
    const cachedImage = this.imagenesCache.get(vehiculoId);
    if (cachedImage) {
      return cachedImage;
    }
    // Si no hay imagen en caché, devolver la imagen por defecto
    return this.sanitizer.bypassSecurityTrustUrl('/assets/imgs/no-imagen.jpeg');
  }

  onSearch(): void {
    const query = this.searchForm.get('query')?.value;
    if (!query) {
      this.loadVehiculos();
      return;
    }

    this.loading = true;
    this.vehiculosService.searchVehiculos(query).subscribe({
      next: (resultados) => {
        this.vehiculos = Array.isArray(resultados) ? resultados : [];
        this.totalItems = this.vehiculos.length;
        this.currentPage = 1;
        this.loading = false;
        this.loadVehiculosImagenes();
        
        if (this.vehiculos.length === 0) {
          this.toastr.info('No se encontraron vehículos que coincidan con tu búsqueda');
        }
      },
      error: (error) => {
        console.error('Error en la búsqueda:', error);
        this.toastr.error('Error al realizar la búsqueda. Por favor, intente nuevamente.');
        this.loading = false;
        // En caso de error, mostrar todos los vehículos
        this.loadVehiculos();
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.router.navigate(['/catalogo/pagina', page]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = '/assets/imgs/no-imagen.jpeg';
    }
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.loadVehiculos();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.loading = true;
    const filters = this.filterForm.value;
    
    // Convertir valores de precio a números
    if (filters.precio_min) {
      filters.precio_min = Number(filters.precio_min);
    }
    if (filters.precio_max) {
      filters.precio_max = Number(filters.precio_max);
    }
    
    console.log('Filtros aplicados:', filters); // Para depuración
    
    this.vehiculosService.filterVehiculos(filters).subscribe({
      next: (response: any) => {
        console.log('Respuesta procesada:', response); // Para depuración
        // Asegurarnos de que vehiculos sea un array
        this.vehiculos = Array.isArray(response.data) ? response.data : [];
        this.totalItems = response.total || 0;
        this.loading = false;
        
        if (this.vehiculos.length > 0) {
          this.loadVehiculosImagenes();
        } else {
          this.toastr.info('No se encontraron vehículos que coincidan con los filtros');
        }
      },
      error: (error) => {
        console.error('Error al aplicar filtros:', error);
        this.toastr.error('Error al aplicar los filtros. Por favor, intente nuevamente.');
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadVehiculos();
  }
}
