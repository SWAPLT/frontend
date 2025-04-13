import { Component, OnInit } from '@angular/core';
import { VehiculoService } from '../../services/vehiculos/vehiculo.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mis-vehiculos',
  templateUrl: './mis-vehiculos.component.html',
  styleUrls: ['./mis-vehiculos.component.css']
})
export class MisVehiculosComponent implements OnInit {
  vehiculos: any[] = [];
  loading = true;
  error = false;

  constructor(
    private vehiculoService: VehiculoService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadVehiculos();
  }

  loadVehiculos(): void {
    this.loading = true;
    this.vehiculoService.getUserVehicles().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.vehiculos = response.data;
        } else {
          this.toastr.error(response.message || 'Error al cargar los vehículos');
          this.error = true;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar vehículos:', error);
        this.toastr.error('Error al cargar los vehículos');
        this.error = true;
        this.loading = false;
      }
    });
  }

  verDetalles(vehiculoId: number): void {
    this.router.navigate(['/vehiculo', vehiculoId]);
  }

  editarVehiculo(vehiculoId: number): void {
    this.router.navigate(['/editar-vehiculo', vehiculoId]);
  }
} 