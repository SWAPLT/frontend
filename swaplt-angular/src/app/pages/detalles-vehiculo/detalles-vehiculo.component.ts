import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VehiculosService } from '../catalogo/services/vehiculos.service';
import { ToastrService } from 'ngx-toastr';
import { FavoritosService } from '../../services/favoritos.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { VehiculoReporteService } from '../../services/vehiculo-reporte.service';
import { VehiculoImagenService } from '../../services/vehiculo-imagen.service';
import { environment } from '../../../environments/environment';

interface Imagen {
  id: number;
  url: string;
  orden: number;
  vehiculo_id: number;
  preview_url: string;
}

interface Vehiculo {
  id: number;
  user_id: number;
  categoria_id: number;
  marca: string;
  modelo: string;
  precio: number;
  anio: number;
  estado: string;
  transmision: string;
  tipo_combustible: string;
  kilometraje: number;
  fuerza: number;
  capacidad_motor: number;
  color: string;
  ubicacion: string;
  matricula: string;
  numero_serie: string;
  numero_puertas: number;
  descripcion: string;
  vehiculo_robado: string;
  vehiculo_libre_accidentes: string;
  imagenes: Imagen[];
  propietario: {
    nombre: string;
    id: number;
  };
}

@Component({
  selector: 'app-detalles-vehiculo',
  templateUrl: './detalles-vehiculo.component.html',
  styleUrls: ['./detalles-vehiculo.component.css']
})
export class DetallesVehiculoComponent implements OnInit {
  vehiculo: Vehiculo | null = null;
  loading = true;
  error = false;
  favoritos: number[] = [];
  animating = false;
  selectedImageIndex = 0;
  selectedFiles: File[] = [];
  isUploading = false;
  esPropietario = false;
  
  // Propiedades para el mapa
  center: google.maps.LatLngLiteral = { lat: 40.4168, lng: -3.7038 }; // Madrid por defecto
  zoom = 15;
  markerPosition: google.maps.LatLngLiteral | null = null;
  apiLoaded = false;
  geocoder: google.maps.Geocoder | null = null;

  constructor(
    private route: ActivatedRoute,
    private vehiculosService: VehiculosService,
    private favoritosService: FavoritosService,
    private toastr: ToastrService,
    public authService: AuthService,
    private router: Router,
    private reporteService: VehiculoReporteService,
    private vehiculoImagenService: VehiculoImagenService
  ) {
    // Cargar el script de Google Maps de manera asíncrona
    if (!this.apiLoaded) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places&callback=Function.prototype`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      this.apiLoaded = true;
    }
  }

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
        // Verificar si el usuario actual es el propietario
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          this.esPropietario = user.id === this.vehiculo?.user_id;
        }
        
        // Actualizar la ubicación del mapa si hay una ubicación válida
        if (this.vehiculo?.ubicacion) {
          this.updateMapLocation(this.vehiculo.ubicacion);
        }
        
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

  updateMapLocation(location: string): void {
    if (!this.geocoder) {
      this.geocoder = new google.maps.Geocoder();
    }

    this.geocoder.geocode({ address: location }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        this.center = {
          lat: location.lat(),
          lng: location.lng()
        };
        this.markerPosition = this.center;
        this.zoom = 15;
      } else {
        console.error('Error al geocodificar la ubicación:', status);
        this.toastr.warning('No se pudo encontrar la ubicación exacta del vehículo');
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

    if (!this.vehiculo?.id) {
      this.toastr.error('No se puede agregar a favoritos: vehículo no disponible');
      return;
    }

    this.animating = true;
    if (this.isFavorito()) {
      // Obtener el ID del favorito correspondiente a este vehículo
      this.favoritosService.getFavoritos().subscribe({
        next: (favoritos) => {
          const favorito = favoritos.find(f => f.vehiculo_id === this.vehiculo?.id);
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
    return this.vehiculo?.id !== undefined && this.favoritos.includes(this.vehiculo.id);
  }

  contactar(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      this.toastr.warning('Por favor inicia sesión para contactar al vendedor');
      return;
    }

    if (!this.vehiculo || !this.vehiculo.user_id) {
      this.toastr.error('No se pudo obtener la información del vendedor');
      return;
    }

    console.log('Redirigiendo al chat con el usuario:', this.vehiculo.user_id);
    this.router.navigate(['/mensajes', this.vehiculo.user_id]);
    this.toastr.success('Redirigiendo al chat con el vendedor');
  }

  selectImage(index: number): void {
    if (this.vehiculo && this.vehiculo.imagenes && this.vehiculo.imagenes.length > index) {
      this.selectedImageIndex = index;
    }
  }

  getSelectedImage(): string | null {
    if (this.vehiculo && this.vehiculo.imagenes && this.vehiculo.imagenes.length > this.selectedImageIndex) {
      return this.vehiculo.imagenes[this.selectedImageIndex].preview_url || this.vehiculo.imagenes[this.selectedImageIndex].url;
    }
    return null;
  }

  descargarReporte(): void {
    if (!this.vehiculo?.id) {
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
        link.download = `reporte_vehiculo_${this.vehiculo?.id}.pdf`;
        
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  subirImagenes(): void {
    if (!this.vehiculo?.id) {
      this.toastr.error('No hay vehículo seleccionado');
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.toastr.warning('Por favor seleccione al menos una imagen');
      return;
    }

    this.isUploading = true;
    this.vehiculoImagenService.subirImagenes(this.vehiculo.id, this.selectedFiles).subscribe({
      next: (response) => {
        this.toastr.success('Imágenes subidas con éxito');
        this.loadVehiculo(this.vehiculo!.id);
        this.selectedFiles = [];
        this.isUploading = false;
      },
      error: (error) => {
        console.error('Error al subir imágenes:', error);
        this.toastr.error('Error al subir las imágenes');
        this.isUploading = false;
      }
    });
  }

  eliminarImagen(imagenId: number): void {
    if (!this.vehiculo?.id) {
      this.toastr.error('No hay vehículo seleccionado');
      return;
    }

    if (confirm('¿Está seguro de que desea eliminar esta imagen?')) {
      this.vehiculoImagenService.eliminarImagen(this.vehiculo.id, imagenId).subscribe({
        next: () => {
          this.toastr.success('Imagen eliminada con éxito');
          this.loadVehiculo(this.vehiculo!.id);
        },
        error: (error) => {
          console.error('Error al eliminar la imagen:', error);
          this.toastr.error('Error al eliminar la imagen');
        }
      });
    }
  }
} 