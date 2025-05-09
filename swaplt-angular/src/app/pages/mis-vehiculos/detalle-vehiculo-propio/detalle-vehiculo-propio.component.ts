import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehiculoService, Vehiculo } from 'src/app/services/vehiculos/vehiculo.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-detalle-vehiculo-propio',
  templateUrl: './detalle-vehiculo-propio.component.html',
  styleUrls: ['./detalle-vehiculo-propio.component.css']
})
export class DetalleVehiculoPropioComponent implements OnInit {
  vehiculo: Vehiculo | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private vehiculoService: VehiculoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cargarVehiculo(+id);
      } else {
        this.error = 'ID de vehículo no válido';
      }
    });
  }

  cargarVehiculo(id: number) {
    this.loading = true;
    this.error = null;
    this.vehiculoService.obtenerVehiculoPorId(id).subscribe({
      next: (vehiculo) => {
        this.vehiculo = vehiculo;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar el vehículo o no tienes permiso.';
        this.loading = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/mis-vehiculos']);
  }
}
