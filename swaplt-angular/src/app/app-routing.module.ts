import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from "./pages/register/register.component";
import { DetallesVehiculoComponent } from './pages/detalles-vehiculo/detalles-vehiculo.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import {AccesoDenegadoComponent} from "./admin/acceso-denegado/acceso-denegado.component";
import { VenderVehiculoComponent } from './pages/vender-vehiculo/vender-vehiculo.component';
import { MisVehiculosComponent } from './pages/mis-vehiculos/mis-vehiculos.component';
import { EditarVehiculoComponent } from './pages/editar-vehiculo/editar-vehiculo.component';
import { MensajesComponent } from './pages/mensajes/mensajes.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { PerfilUsuarioComponent } from './pages/perfil-usuario/perfil-usuario.component';
import { DetalleVehiculoPropioComponent } from './pages/mis-vehiculos/detalle-vehiculo-propio/detalle-vehiculo-propio.component';

const routes: Routes = [
  { path: '', redirectTo: '/catalogo', pathMatch: 'full' }, // Redirigir a catálogo por defecto
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'vehiculo/:id', component: DetallesVehiculoComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  { path: 'acceso-denegado', component: AccesoDenegadoComponent },
  { path: 'profile', component: ProfileComponent }, // Asegúrate de tener la ruta para el perfil
  { path: 'vender-vehiculo', component: VenderVehiculoComponent },
  { path: 'mis-vehiculos', component: MisVehiculosComponent, canActivate: [AuthGuard] },
  { path: 'mis-vehiculos/:id', component: DetalleVehiculoPropioComponent, canActivate: [AuthGuard] },
  { path: 'catalogo', loadChildren: () => import('./pages/catalogo/catalogo.module').then(m => m.CatalogoModule), canActivate: [AuthGuard] },
  { path: 'favoritos', loadChildren: () => import('./pages/favoritos/favoritos.module').then(m => m.FavoritosModule), canActivate: [AuthGuard] },
  { path: 'static', loadChildren: () => import('./pages/static/static.module').then(m => m.StaticModule) },
  { path: 'editar-vehiculo/:id', component: EditarVehiculoComponent, canActivate: [AuthGuard] },
  { path: 'mensajes', component: MensajesComponent, canActivate: [AuthGuard] },
  { path: 'mensajes/:usuarioId', component: MensajesComponent, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'perfil-usuario/:id', component: PerfilUsuarioComponent },
  { path: '**', redirectTo: '/catalogo' }  // Redirige a catálogo si la ruta no existe
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
