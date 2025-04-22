import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { VehiculoService } from '../../services/vehiculos/vehiculo.service';
import { AuthService } from '../../services/auth.service';

interface Categoria {
  id: number;
  nombre: string;
}

interface VehiculoFormControls {
  categoria_id: AbstractControl;
  marca: AbstractControl;
  modelo: AbstractControl;
  precio: AbstractControl;
  anio: AbstractControl;
  estado: AbstractControl;
  transmision: AbstractControl;
  tipo_combustible: AbstractControl;
  kilometraje: AbstractControl;
  fuerza: AbstractControl;
  capacidad_motor: AbstractControl;
  color: AbstractControl;
  ubicacion: AbstractControl;
  matricula: AbstractControl;
  numero_serie: AbstractControl;
  numero_puertas: AbstractControl;
  descripcion: AbstractControl;
  vehiculo_robado: AbstractControl;
  vehiculo_libre_accidentes: AbstractControl;
}

@Component({
  selector: 'app-vender-vehiculo',
  templateUrl: './vender-vehiculo.component.html',
  styleUrls: ['./vender-vehiculo.component.css']
})
export class VenderVehiculoComponent implements OnInit {
  vehiculoForm!: FormGroup;
  categorias: Categoria[] = [];
  errorMessage: string = '';
  loading: boolean = false;
  userId: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private vehiculoService: VehiculoService,
    private authService: AuthService
  ) {
    // Obtener el ID del usuario del localStorage
    const userStr = localStorage.getItem('user');
    this.userId = userStr ? JSON.parse(userStr).id : null;

    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.initForm();
  }

  private initForm(): void {
    this.vehiculoForm = this.fb.group({
      categoria_id: ['', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      anio: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      estado: ['', Validators.required],
      transmision: ['', Validators.required],
      tipo_combustible: ['', Validators.required],
      kilometraje: ['', [Validators.required, Validators.min(0)]],
      fuerza: ['', [Validators.required, Validators.min(0)]],
      capacidad_motor: ['', [Validators.required, Validators.min(0)]],
      color: ['', Validators.required],
      ubicacion: ['', Validators.required],
      matricula: ['', [Validators.required, Validators.pattern('[0-9]{4}[A-Z]{3}')]],
      numero_serie: ['', Validators.required],
      numero_puertas: ['', [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(255)]],
      vehiculo_robado: ['', Validators.required],
      vehiculo_libre_accidentes: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.vehiculoService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.errorMessage = 'Error al cargar las categorías. Por favor, intente más tarde.';
      }
    });
  }

  onSubmit(): void {
    if (this.vehiculoForm.valid) {
      this.loading = true;
      const vehiculoData = {
        ...this.vehiculoForm.value,
        user_id: this.userId
      };

      console.log('Datos enviados al backend:', vehiculoData);

      this.vehiculoService.crear(vehiculoData).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al crear vehículo:', error);
          this.errorMessage = 'Error al crear el vehículo. Por favor, intente más tarde.';
          this.markFormGroupTouched(this.vehiculoForm);
        }
      });
    } else {
      this.markFormGroupTouched(this.vehiculoForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.vehiculoForm.controls;
  }
}
