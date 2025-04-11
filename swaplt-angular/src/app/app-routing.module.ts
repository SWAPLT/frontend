import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from "./pages/register/register.component";
import { VehicleDetailComponent } from './pages/vehicle-detail/vehicle-detail.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import {AccesoDenegadoComponent} from "./admin/acceso-denegado/acceso-denegado.component";
import { VenderVehiculoComponent } from './pages/vender-vehiculo/vender-vehiculo.component';

const routes: Routes = [
  { path: '', redirectTo: '/catalogo', pathMatch: 'full' }, // Redirigir a catálogo por defecto
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'vehicle/:id', component: VehicleDetailComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  { path: 'acceso-denegado', component: AccesoDenegadoComponent },
  { path: 'profile', component: ProfileComponent }, // Asegúrate de tener la ruta para el perfil
  { path: 'vender-vehiculo', component: VenderVehiculoComponent },
  { path: 'catalogo', loadChildren: () => import('./pages/catalogo/catalogo.module').then(m => m.CatalogoModule) },
  { path: '**', redirectTo: '/catalogo' }  // Redirige a catálogo si la ruta no existe
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
