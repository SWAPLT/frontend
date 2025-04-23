import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VehiculoService, Vehiculo } from '../../services/vehiculos/vehiculo.service';
import { ToastrService } from 'ngx-toastr';
import { VehiculoImagenService } from '../../services/vehiculos/vehiculo-imagen.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-mis-vehiculos',
  templateUrl: './mis-vehiculos.component.html',
  styleUrls: ['./mis-vehiculos.component.css']
})
export class MisVehiculosComponent implements OnInit {
  vehiculos: Vehiculo[] = [];
  vehiculosPaginados: Vehiculo[] = [];
  loading = false;
  error = false;
  imagenesCache: Map<number, SafeUrl> = new Map();
  
  // Propiedades para paginación
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;

  constructor(
    private vehiculoService: VehiculoService,
    private router: Router,
    private toastr: ToastrService,
    private vehiculoImagenService: VehiculoImagenService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadVehiculos();
  }

  loadVehiculos(): void {
    this.loading = true;
    this.error = false;

    this.vehiculoService.getUserVehicles().subscribe({
      next: (vehiculos: Vehiculo[]) => {
        this.vehiculos = vehiculos;
        this.totalItems = vehiculos.length;
        this.applyPagination();
        this.loading = false;
        this.loadVehiculosImagenes();
      },
      error: (error) => {
        console.error('Error al cargar vehículos:', error);
        this.error = true;
        this.loading = false;
        this.toastr.error('Error al cargar los vehículos. Por favor, intente nuevamente.');
      }
    });
  }

  loadVehiculosImagenes(): void {
    this.vehiculosPaginados.forEach(vehiculo => {
      if (vehiculo.id && !this.imagenesCache.has(vehiculo.id)) {
        this.vehiculoImagenService.getPrimeraImagen(vehiculo.id)
          .pipe(
            catchError(() => of(null))
          )
          .subscribe(blob => {
            if (blob) {
              const imageUrl = URL.createObjectURL(blob);
              const safeUrl = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
              this.imagenesCache.set(vehiculo.id, safeUrl);
            }
          });
      }
    });
  }

  getVehiculoImagen(vehiculoId: number): SafeUrl | null {
    return this.imagenesCache.get(vehiculoId) || null;
  }

  // Aplicar paginación
  applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.vehiculos.length);
    this.vehiculosPaginados = this.vehiculos.slice(startIndex, endIndex);
  }

  // Manejar cambio de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyPagination();
    this.loadVehiculosImagenes();
  }

  verDetalles(id: number): void {
    if (id) {
      window.open(`/vehiculo/${id}`, '_blank');
    }
  }

  editarVehiculo(id: number): void {
    if (id) {
      this.router.navigate(['/editar-vehiculo', id]);
    }
  }

  eliminarVehiculo(id: number): void {
    if (id) {
      if (confirm('¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer.')) {
        this.loading = true;
        this.vehiculoService.eliminar(id).subscribe({
          next: () => {
            this.toastr.success('Vehículo eliminado con éxito');
            this.loadVehiculos(); // Recargar la lista de vehículos
          },
          error: (error) => {
            console.error('Error al eliminar el vehículo:', error);
            this.toastr.error('Error al eliminar el vehículo');
            this.loading = false;
          }
        });
      }
    }
  }
} 