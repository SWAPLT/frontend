// src/app/admin/vehiculos/vehiculos.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {VehiculosService} from "./service/vehiculos.service";

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.component.html',
  styleUrls: ['./vehiculos.component.css']
})
export class VehiculosComponent implements OnInit {
  vehiculos: any[] = [];
  displayedVehiculos: any[] = []; // Vehículos mostrados en la página actual
  isLoading: boolean = false;
  errorMessage = '';
  vehiculoForm: FormGroup;
  usuarios: any[] = []; // lista de usuarios
  formMode: 'list' | 'create' | 'edit' = 'list';
  currentVehiculoId: number | null = null;
  
  // Propiedades para paginación
  currentPage: number = 1;
  itemsPerPage: number = 6; // 6 vehículos por página
  totalItems: number = 0;
  allVehiculos: any[] = []; // Almacenar todos los vehículos


  constructor(
    private vehiculosService: VehiculosService,
    private fb: FormBuilder
  ) {
    this.vehiculoForm = this.fb.group({
      user_id: ['', Validators.required],
      categoria_id: ['', Validators.required],
      marca: ['', [Validators.required, Validators.maxLength(255)]],
      modelo: ['', [Validators.required, Validators.maxLength(255)]],
      precio: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      anio: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      estado: ['', Validators.required], // Se usará un select con opciones: nuevo, usado
      transmision: ['', [Validators.required, Validators.maxLength(255)]],
      tipo_combustible: ['', [Validators.required, Validators.maxLength(255)]],
      kilometraje: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      fuerza: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      capacidad_motor: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9])?$')]],
      color: ['', [Validators.required, Validators.maxLength(255)]],
      ubicacion: ['', [Validators.required, Validators.maxLength(255)]],
      matricula: ['', [Validators.required, Validators.maxLength(255)]],
      numero_serie: ['', [Validators.required, Validators.maxLength(255)]],
      numero_puertas: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      descripcion: ['', Validators.required],
      vehiculo_robado: ['', Validators.required],
      vehiculo_libre_accidentes: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadVehiculos();
    this.loadUsuarios(); 
  }

  // Carga la lista de vehículos
  loadVehiculos(): void {
    this.isLoading = true;
    this.vehiculosService.getVehiculos(this.currentPage).subscribe(
      (response) => {
        this.displayedVehiculos = response.data;
        this.vehiculos = this.displayedVehiculos;
        this.totalItems = response.total;
        this.currentPage = response.current_page;
        this.itemsPerPage = response.per_page;
        this.isLoading = false;
        this.formMode = 'list';
        console.log('Vehículos cargados:', this.vehiculos);
      },
      (error) => {
        this.errorMessage = 'Error al cargar los vehiculos';
        console.error('Error al cargar vehículos:', error);
        this.isLoading = false;
      }
    );
  }
  
  // Aplicar paginación en el cliente
  applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.allVehiculos.length);
    this.displayedVehiculos = this.allVehiculos.slice(startIndex, endIndex);
    this.vehiculos = this.displayedVehiculos; // Para mantener compatibilidad con el template
    console.log(`Mostrando vehículos ${startIndex + 1} a ${endIndex} de ${this.totalItems}`);
  }
  
  // Manejar cambio de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadVehiculos();
    // Desplazar la página al principio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Carga los usuarios
  loadUsuarios(): void {
    this.vehiculosService.getUsuarios().subscribe(
      data => {
        this.usuarios = data;
      },
      error => {
        console.error('Error al cargar usuarios:', error);
      }
    );
  }

  // Función para obtener el nombre del usuario desde su ID
  getNombreUsuario(userId: number): string {
    const usuario = this.usuarios.find(u => u.id === userId);
    return usuario ? usuario.name : 'Desconocido';
  }

  // Muestra el formulario para crear
  showCreateForm(): void {
    this.formMode = 'create';
    this.vehiculoForm.reset();
    this.currentVehiculoId = null;
  }

  // Muestra el formulario para editar y carga los datos del vehículo seleccionado
  showEditForm(vehiculo: any): void {
    this.formMode = 'edit';
    this.currentVehiculoId = vehiculo.id;
    this.vehiculoForm.patchValue(vehiculo);
  }

  // Cancela el formulario y vuelve al listado
  cancelForm(): void {
    this.formMode = 'list';
    this.vehiculoForm.reset();
    this.currentVehiculoId = null;
  }

  // Envía el formulario para crear o actualizar
  submitForm(): void {
    if (this.vehiculoForm.invalid) {
      return;
    }

    // Si es creación
    if (this.formMode === 'create') {
      this.vehiculosService.createVehiculo(this.vehiculoForm.value).subscribe(
        (response) => {
          console.log(response); // Mostrar la respuesta en consola
          this.loadVehiculos();
          this.formMode = 'list'; // Volver a la lista
        },
        (error) => {
          this.errorMessage = error;
        }
      );
    }
    // Si es actualización
    else if (this.formMode === 'edit' && this.currentVehiculoId) {
      // Asegúrate de que el ID se pase correctamente en la petición de actualización
      const updatedVehiculo = { ...this.vehiculoForm.value, id: this.currentVehiculoId }; // Asegurarse de que el ID esté incluido
      this.vehiculosService.updateVehiculo(this.currentVehiculoId, updatedVehiculo).subscribe(
        (response) => {
          console.log(response); // Mostrar la respuesta en consola
          this.loadVehiculos();
          this.formMode = 'list'; // Volver a la lista
        },
        (error) => {
          this.errorMessage = error;
        }
      );
    }
  }

  // Elimina un vehículo
  deleteVehiculo(id: number): void {
    if (confirm('¿Estás seguro de eliminar este vehículo?')) {
      this.vehiculosService.deleteVehiculo(id).subscribe(
        () => {
          // Actualizar la lista de vehículos
          this.loadVehiculos();
        },
        error => {
          this.errorMessage = error;
        }
      );
    }
  }
}

