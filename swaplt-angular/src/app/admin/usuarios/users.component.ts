import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {UsersService} from "./service/users.service";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  displayedUsers: any[] = []; // Usuarios mostrados en la página actual
  formMode: 'list' | 'create' | 'edit' = 'list';
  userForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  currentUserId: number | null = null;
  
  // Propiedades para paginación
  currentPage: number = 1;
  itemsPerPage: number = 6; // Cambiar a 6 usuarios por página
  totalItems: number = 0;
  allUsers: any[] = []; // Almacenar todos los usuarios

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      password_confirmation: [''],
      rol: ['user']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('password_confirmation')?.value
      ? null : { mismatch: true };
  }

  loadUsers() {
    this.isLoading = true;
    this.usersService.getUsers(this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        // Verificar el formato de la respuesta
        if (Array.isArray(response)) {
          // Si la respuesta es un array directo de usuarios
          this.allUsers = response;
          this.totalItems = this.allUsers.length;
          console.log('Total usuarios cargados:', this.totalItems);
          this.applyPagination();
          this.isLoading = false;
        } else if (response.data && response.meta) {
          // Si la respuesta tiene el formato esperado con paginación
          this.displayedUsers = response.data;
          this.users = this.displayedUsers; // Para compatibilidad
          this.totalItems = response.meta.total;
          this.currentPage = response.meta.current_page;
          this.itemsPerPage = response.meta.per_page;
          this.isLoading = false;
          console.log('Usuarios paginados cargados:', this.users);
        } else {
          // Otro formato, tratar de adaptarlo
          console.log('Formato de respuesta desconocido:', response);
          if (response.users) {
            this.allUsers = response.users;
          } else {
            this.allUsers = [];
          }
          this.totalItems = this.allUsers.length;
          this.applyPagination();
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los usuarios';
        this.isLoading = false;
        console.error('Error al cargar usuarios:', err);
      }
    });
  }
  
  // Aplicar paginación en el cliente
  applyPagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.allUsers.length);
    this.displayedUsers = this.allUsers.slice(startIndex, endIndex);
    this.users = this.displayedUsers; // Para mantener compatibilidad con el template
    console.log(`Mostrando usuarios ${startIndex + 1} a ${endIndex} de ${this.totalItems}`);
  }
  
  onPageChange(page: any): void {
    console.log('Cambiando a página:', page);
    // Verificar que page sea un número válido
    const pageNumber = parseInt(page, 10);
    if (!isNaN(pageNumber) && pageNumber > 0) {
      this.currentPage = pageNumber;
      
      // Si tenemos todos los usuarios, solo aplicamos paginación local
      if (this.allUsers.length > 0) {
        this.applyPagination();
      } else {
        // Si no, hacemos una nueva petición al servidor
        this.loadUsers();
      }
    } else {
      console.error('Número de página inválido:', page);
    }
  }

  showCreateForm() {
    this.formMode = 'create';
    this.userForm.reset({ rol: 'user' });
  }

  showEditForm(user: any) {
    this.formMode = 'edit';
    this.currentUserId = user.id;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      rol: user.rol
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password_confirmation')?.clearValidators();
    this.userForm.updateValueAndValidity();
  }

  submitForm() {
    if (this.userForm.invalid) {
      this.errorMessage = 'Por favor complete el formulario correctamente';
      return;
    }

    const userData = this.userForm.value;
    if (this.formMode === 'create') {
      this.createUser(userData);
    } else {
      this.updateUser(userData);
    }
  }

  createUser(userData: any) {
    this.usersService.createUser(userData).subscribe({
      next: () => {
        this.loadUsers();
        this.formMode = 'list';
      },
      error: (err) => {
        this.errorMessage = 'Error al crear el usuario';
        console.error(err);
      }
    });
  }

  updateUser(userData: any) {
    if (!this.currentUserId) return;

    // No enviar contraseña si no se cambió
    if (!userData.password) {
      delete userData.password;
      delete userData.password_confirmation;
    }

    this.usersService.updateUser(this.currentUserId, userData).subscribe({
      next: () => {
        this.loadUsers();
        this.formMode = 'list';
      },
      error: (err) => {
        this.errorMessage = 'Error al actualizar el usuario';
        console.error(err);
      }
    });
  }

  deleteUser(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      this.usersService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage = 'Error al eliminar el usuario';
          console.error(err);
        }
      });
    }
  }

  promoteToAdmin(id: number) {
    this.usersService.promoteToAdmin(id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage = 'Error al promover al usuario';
        console.error(err);
      }
    });
  }

  demoteToUser(id: number) {
    this.usersService.demoteToUser(id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage = 'Error al degradar al usuario';
        console.error(err);
      }
    });
  }

  cancelForm() {
    this.formMode = 'list';
    this.userForm.reset();
    this.errorMessage = '';
  }
}
