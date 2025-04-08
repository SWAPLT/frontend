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
  formMode: 'list' | 'create' | 'edit' = 'list';
  userForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  currentUserId: number | null = null;

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
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los usuarios';
        this.isLoading = false;
        console.error(err);
      }
    });
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
