import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { UsersComponent } from './usuarios/users.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { AdminRoutingModule } from './admin-routing.module';
import {VehiculosComponent} from "./vehiculos/vehiculos.component";
import { AccesoDenegadoComponent } from './acceso-denegado/acceso-denegado.component';

@NgModule({
  declarations: [
    AdminPanelComponent,
    UsersComponent,
    VehiculosComponent,
    CategoriasComponent,
    AccesoDenegadoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule,
    ReactiveFormsModule
  ]
})
export class AdminModule { }
