import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehiculoService, Vehiculo } from '../../services/vehiculos/vehiculo.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-editar-vehiculo',
  templateUrl: './editar-vehiculo.component.html',
  styleUrls: ['./editar-vehiculo.component.css']
})
export class EditarVehiculoComponent implements OnInit {
  vehiculoForm: FormGroup;
  loading = false;
  vehiculoId = 0;

  constructor(
    private fb: FormBuilder,
    private vehiculoService: VehiculoService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.vehiculoForm = this.fb.group({
      user_id: ['', Validators.required],
      categoria_id: ['', Validators.required],
      marca: ['', [Validators.required, Validators.maxLength(255)]],
      modelo: ['', [Validators.required, Validators.maxLength(255)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      anio: ['', [Validators.required, Validators.min(1900)]],
      estado: ['', [Validators.required]],
      transmision: ['', [Validators.required, Validators.maxLength(255)]],
      tipo_combustible: ['', [Validators.required, Validators.maxLength(255)]],
      kilometraje: ['', [Validators.required, Validators.min(0)]],
      fuerza: ['', [Validators.required, Validators.min(0)]],
      capacidad_motor: ['', [Validators.required, Validators.min(0)]],
      color: ['', [Validators.required, Validators.maxLength(255)]],
      ubicacion: ['', [Validators.required, Validators.maxLength(255)]],
      matricula: ['', [Validators.required, Validators.maxLength(255)]],
      numero_serie: ['', [Validators.required, Validators.maxLength(255)]],
      numero_puertas: ['', [Validators.required, Validators.min(0)]],
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
      vehiculo_robado: ['', [Validators.required, Validators.maxLength(255)]],
      vehiculo_libre_accidentes: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.vehiculoId = +this.route.snapshot.params['id'];
    this.cargarVehiculo();
  }

  cargarVehiculo(): void {
    this.loading = true;
    this.vehiculoService.obtenerVehiculoPorId(this.vehiculoId).subscribe({
      next: (vehiculo) => {
        this.vehiculoForm.patchValue(vehiculo);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el vehículo:', error);
        this.toastr.error('Error al cargar el vehículo');
        this.loading = false;
        this.router.navigate(['/mis-vehiculos']);
      }
    });
  }

  onSubmit(): void {
    if (this.vehiculoForm.valid) {
      this.loading = true;
      const vehiculoData = this.vehiculoForm.value;

      this.vehiculoService.actualizarVehiculo(this.vehiculoId, vehiculoData).subscribe({
        next: (response) => {
          this.toastr.success('Vehículo actualizado con éxito');
          this.router.navigate(['/mis-vehiculos']);
        },
        error: (error) => {
          console.error('Error al actualizar el vehículo:', error);
          this.toastr.error(error.message || 'Error al actualizar el vehículo');
          this.loading = false;
        }
      });
    } else {
      this.toastr.error('Por favor, complete todos los campos requeridos correctamente');
    }
  }

  cancelar(): void {
    this.router.navigate(['/mis-vehiculos']);
  }
} 