import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from "./pages/register/register.component";
import { CatalogComponent } from './pages/catalog/catalog.component';
import { VehicleDetailComponent } from './pages/vehicle-detail/vehicle-detail.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SellComponent } from './pages/sell/sell.component';
import { AuthGuard } from './guards/auth.guard';
import {AccesoDenegadoComponent} from "./admin/acceso-denegado/acceso-denegado.component";

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirigir a login por defecto
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'vehicle/:id', component: VehicleDetailComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'sell', component: SellComponent, canActivate: [AuthGuard] },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  { path: 'acceso-denegado', component: AccesoDenegadoComponent },
  { path: 'profile', component: ProfileComponent }, // Asegúrate de tener la ruta para el perfil
  { path: '**', redirectTo: '/acceso-denegado' }  // Redirige a acceso-denegado si la ruta no existe

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
