import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { RouterOutlet } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthInterceptor } from "./interceptors/auth.interceptor";
import { RegisterComponent } from './pages/register/register.component';
import { AdminRoutingModule } from "./admin/admin-routing.module";
import { SharedModule } from './shared/shared.module';
import { VenderVehiculoComponent } from './pages/vender-vehiculo/vender-vehiculo.component';
import { CatalogoModule } from './pages/catalogo/catalogo.module';
import { AdminModule } from './admin/admin.module';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { MisVehiculosComponent } from './pages/mis-vehiculos/mis-vehiculos.component';
import { EditarVehiculoComponent } from './pages/editar-vehiculo/editar-vehiculo.component';
import { AuthGuard } from './guards/auth.guard';
import { DetallesVehiculoComponent } from './pages/detalles-vehiculo/detalles-vehiculo.component';
import { MensajesComponent } from './pages/mensajes/mensajes.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProfileComponent,
    RegisterComponent,
    VenderVehiculoComponent,
    ThemeToggleComponent,
    MisVehiculosComponent,
    EditarVehiculoComponent,
    DetallesVehiculoComponent,
    MensajesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    AdminRoutingModule,
    SharedModule,
    CatalogoModule,
    AdminModule,
    ToastrModule.forRoot(),
    RouterModule.forRoot([
      { 
        path: 'editar-vehiculo/:id', 
        component: EditarVehiculoComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'vehiculo/:id',
        component: DetallesVehiculoComponent
      },
      {
        path: 'mensajes',
        component: MensajesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'mensajes/:usuarioId',
        component: MensajesComponent,
        canActivate: [AuthGuard]
      }
    ])
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
