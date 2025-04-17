import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehiculoService, Vehiculo } from '../../services/vehiculos/vehiculo.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-editar-vehiculo',
  templateUrl: './editar-vehiculo.component.html',
  styleUrls: ['./editar-vehiculo.component.css']
})
export class EditarVehiculoComponent implements OnInit {
  vehiculoForm: FormGroup;
  loading = false;
  vehiculoId = 0;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private vehiculoService: VehiculoService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
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
    this.vehiculoId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.vehiculoId) {
      this.cargarVehiculo();
    } else {
      this.toastr.error('ID de vehículo no válido');
      this.router.navigate(['/mis-vehiculos']);
    }
  }

  cargarVehiculo(): void {
    this.loading = true;
    this.vehiculoService.obtenerVehiculoPorId(this.vehiculoId).subscribe({
      next: (vehiculo) => {
        console.log('Vehículo completo recibido:', vehiculo);
        
        if (!vehiculo || !vehiculo.user_id) {
          console.error('El vehículo no tiene user_id definido:', vehiculo);
          this.toastr.error('Error al cargar los datos del vehículo');
          this.router.navigate(['/mis-vehiculos']);
          return;
        }

        const userId = this.authService.getUserId();
        console.log('ID del usuario autenticado:', userId);
        console.log('ID del propietario del vehículo:', vehiculo.user_id);
        
        if (userId === null) {
          this.toastr.error('No se pudo verificar tu identidad');
          this.router.navigate(['/login']);
          return;
        }

        if (vehiculo.user_id !== userId) {
          this.toastr.error('No tienes permiso para editar este vehículo');
          this.router.navigate(['/mis-vehiculos']);
          return;
        }
        
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
      this.errorMessage = '';
      const vehiculoData = this.vehiculoForm.value;

      this.vehiculoService.actualizarVehiculo(this.vehiculoId, vehiculoData).subscribe({
        next: (response) => {
          this.toastr.success('Vehículo actualizado con éxito');
          this.router.navigate(['/mis-vehiculos']);
        },
        error: (error) => {
          console.error('Error al actualizar el vehículo:', error);
          this.errorMessage = error.error?.message || 'Error al actualizar el vehículo';
          this.toastr.error(this.errorMessage);
          this.loading = false;
        }
      });
    } else {
      this.errorMessage = 'Por favor, complete todos los campos requeridos correctamente';
      this.toastr.error(this.errorMessage);
      Object.keys(this.vehiculoForm.controls).forEach(key => {
        const control = this.vehiculoForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/mis-vehiculos']);
  }
} 