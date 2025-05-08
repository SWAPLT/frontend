// src/app/admin/admin-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './usuarios/users.component';
import { VehiculosComponent } from './vehiculos/vehiculos.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { AuthGuard } from './auth.guard';
import { BloqueosComponent } from './bloqueos/bloqueos.component';

const routes: Routes = [
  {
    path: '',
    component: AdminPanelComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'usuarios', component: UsersComponent },
      { path: 'vehiculos', component: VehiculosComponent },
      { path: 'categorias', component: CategoriasComponent },
      { path: 'bloqueos', component: BloqueosComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
