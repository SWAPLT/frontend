import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { VehiculosService } from './services/vehiculos.service';
import { ToastrService } from 'ngx-toastr';
import { FavoritosService } from '../../shared/services/favoritos.service';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit {
  vehiculos: any[] = [];
  vehiculosFiltrados: any[] = [];
  loading = true;
  error = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  searchForm: FormGroup;
  filtersForm: FormGroup;

  constructor(
    private vehiculosService: VehiculosService,
    private favoritosService: FavoritosService,
    private toastr: ToastrService,
    private fb: FormBuilder
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
    this.loadVehiculos();
  }

  get paginatedVehiculos(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.vehiculosFiltrados.slice(startIndex, startIndex + this.itemsPerPage);
  }

  loadVehiculos(): void {
    this.loading = true;
    console.log('Cargando vehículos...');
    this.vehiculosService.getVehiculos()
      .subscribe({
        next: (response: any[]) => {
          this.vehiculos = response;
          this.vehiculosFiltrados = [...this.vehiculos];
          this.totalItems = this.vehiculos.length;
          this.loading = false;
          console.log('Vehículos cargados:', this.vehiculos);
        },
        error: (error: any) => {
          console.error('Error al cargar vehículos:', error);
          this.error = true;
          this.loading = false;
          this.toastr.error('Error al cargar los vehículos', 'Error');
        }
      });
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
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  toggleFavorito(vehiculo: any): void {
    if (this.isFavorito(vehiculo.id)) {
      this.favoritosService.removeFavorito(vehiculo.id);
      this.toastr.success('Vehículo eliminado de favoritos', 'Éxito');
    } else {
      this.favoritosService.addFavorito(vehiculo);
      this.toastr.success('Vehículo agregado a favoritos', 'Éxito');
    }
  }

  isFavorito(vehiculoId: number): boolean {
    return this.favoritosService.isFavorito(vehiculoId);
  }
}
