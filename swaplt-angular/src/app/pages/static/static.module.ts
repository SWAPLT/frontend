import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TerminosComponent } from './terminos/terminos.component';
import { PrivacidadComponent } from './privacidad/privacidad.component';
import { AyudaComponent } from './ayuda/ayuda.component';

const routes: Routes = [
  { path: 'terminos', component: TerminosComponent },
  { path: 'privacidad', component: PrivacidadComponent },
  { path: 'ayuda', component: AyudaComponent }
];

@NgModule({
  declarations: [
    TerminosComponent,
    PrivacidadComponent,
    AyudaComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class StaticModule { } 