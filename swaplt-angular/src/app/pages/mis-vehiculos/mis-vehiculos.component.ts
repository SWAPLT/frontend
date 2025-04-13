import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VehiculoService, Vehiculo } from '../../services/vehiculos/vehiculo.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mis-vehiculos',
  templateUrl: './mis-vehiculos.component.html',
  styleUrls: ['./mis-vehiculos.component.css']
})
export class MisVehiculosComponent implements OnInit {
  vehiculos: Vehiculo[] = [];
  loading = false;
  error = false;
  
  // Propiedades para paginación
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;

  constructor(
    private vehiculoService: VehiculoService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadVehiculos();
  }

  loadVehiculos(): void {
    this.loading = true;
    this.error = false;

    this.vehiculoService.getUserVehicles().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.vehiculos = response.data;
          this.totalItems = this.vehiculos.length;
          this.applyPagination();
        } else {
          this.error = true;
          this.toastr.error(response.message || 'Error al cargar los vehículos');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar vehículos:', error);
        this.error = true;
        this.loading = false;
        this.toastr.error('Error al cargar los vehículos');
      }
    });
  }

  // Aplicar paginación
  applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.vehiculos.length);
    this.vehiculos = this.vehiculos.slice(startIndex, endIndex);
  }

  // Manejar cambio de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadVehiculos();
  }

  verDetalles(id: number): void {
    if (id) {
      this.router.navigate(['/vehiculo', id]);
    }
  }

  editarVehiculo(id: number): void {
    if (id) {
      this.router.navigate(['/editar-vehiculo', id]);
    }
  }
} 