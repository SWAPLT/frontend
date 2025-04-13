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