import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VehiculosService } from '../catalogo/services/vehiculos.service';
import { ToastrService } from 'ngx-toastr';
import { FavoritosService } from '../../services/favoritos.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { VehiculoReporteService } from '../../services/vehiculo-reporte.service';

@Component({
  selector: 'app-detalles-vehiculo',
  templateUrl: './detalles-vehiculo.component.html',
  styleUrls: ['./detalles-vehiculo.component.css']
})
export class DetallesVehiculoComponent implements OnInit {
  vehiculo: any;
  loading = true;
  error = false;
  favoritos: number[] = [];
  animating = false;
  selectedImageIndex = 0; // Índice de la imagen seleccionada actualmente

  constructor(
    private route: ActivatedRoute,
    private vehiculosService: VehiculosService,
    private favoritosService: FavoritosService,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private reporteService: VehiculoReporteService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVehiculo(parseInt(id));
      if (this.authService.isAuthenticated()) {
        this.loadFavoritos();
      }
    }
  }

  loadVehiculo(id: number): void {
    this.loading = true;
    this.vehiculosService.getVehiculoById(id).subscribe({
      next: (response) => {
        this.vehiculo = response;
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Error al cargar el vehículo:', error);
        this.error = true;
        this.loading = false;
        this.toastr.error('Error al cargar los detalles del vehículo', 'Error');
      }
    });
  }

  loadFavoritos(): void {
    this.favoritosService.getFavoritos().subscribe({
      next: (response) => {
        this.favoritos = response.map((fav: any) => fav.vehiculo_id);
      },
      error: (error: unknown) => {
        console.error('Error al cargar favoritos:', error);
      }
    });
  }

  toggleFavorito(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      this.toastr.warning('Por favor inicia sesión para agregar a favoritos');
      return;
    }

    this.animating = true;
    if (this.isFavorito()) {
      // Obtener el ID del favorito correspondiente a este vehículo
      this.favoritosService.getFavoritos().subscribe({
        next: (favoritos) => {
          const favorito = favoritos.find(f => f.vehiculo_id === this.vehiculo.id);
          if (favorito) {
            this.favoritosService.removeFavoritoById(favorito.id).subscribe({
              next: () => {
                this.loadFavoritos();
                this.toastr.success('Vehículo eliminado de favoritos');
                setTimeout(() => this.animating = false, 1000);
              },
              error: (error: unknown) => {
                console.error('Error al eliminar de favoritos:', error);
                this.toastr.error('Error al eliminar de favoritos');
                this.animating = false;
              }
            });
          }
        },
        error: (error: unknown) => {
          console.error('Error al obtener favoritos:', error);
          this.toastr.error('Error al obtener favoritos');
          this.animating = false;
        }
      });
    } else {
      this.favoritosService.addFavorito(this.vehiculo.id).subscribe({
        next: () => {
          this.loadFavoritos();
          this.toastr.success('Vehículo agregado a favoritos');
          setTimeout(() => this.animating = false, 1000);
        },
        error: (error: unknown) => {
          console.error('Error al agregar a favoritos:', error);
          this.toastr.error('Error al agregar a favoritos');
          this.animating = false;
        }
      });
    }
  }

  isFavorito(): boolean {
    return this.vehiculo && this.favoritos.includes(this.vehiculo.id);
  }

  contactar(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      this.toastr.warning('Por favor inicia sesión para contactar al vendedor');
      return;
    }
    this.router.navigate(['/mensajes'], { queryParams: { vehiculo: this.vehiculo.id } });
  }

  // Método para seleccionar una imagen de la galería
  selectImage(index: number): void {
    this.selectedImageIndex = index;
    if (this.vehiculo.imagenes && this.vehiculo.imagenes.length > index) {
      this.vehiculo.imagen_url = this.vehiculo.imagenes[index];
    }
  }

  descargarReporte(): void {
    if (!this.vehiculo) {
      this.toastr.error('No hay vehículo seleccionado');
      return;
    }

    this.reporteService.generarReporte(this.vehiculo.id).subscribe({
      next: (blob) => {
        // Crear un blob URL
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Crear un elemento <a> temporal
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `reporte_vehiculo_${this.vehiculo.id}.pdf`;
        
        // Añadir el elemento al DOM
        document.body.appendChild(link);
        
        // Simular el clic
        link.click();
        
        // Limpiar
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
        
        this.toastr.success('Reporte descargado exitosamente');
      },
      error: (error) => {
        console.error('Error al descargar el reporte:', error);
        this.toastr.error('Error al descargar el reporte');
      }
    });
  }
} 