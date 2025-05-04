import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PerfilUsuarioComponent } from './perfil-usuario.component';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    PerfilUsuarioComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ToastrModule
  ],
  exports: [
    PerfilUsuarioComponent
  ]
})
export class PerfilUsuarioModule { } 