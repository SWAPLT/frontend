import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogoComponent } from './catalogo.component';
import { DetallesVehiculoComponent } from '../detalles-vehiculo/detalles-vehiculo.component';

const routes: Routes = [
  {
    path: '',
    component: CatalogoComponent
  },
  {
    path: 'vehiculo/:id',
    component: DetallesVehiculoComponent
  },
  {
    path: 'pagina/:page',
    component: CatalogoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogoRoutingModule { } 