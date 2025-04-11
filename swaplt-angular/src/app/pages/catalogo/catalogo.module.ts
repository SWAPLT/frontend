import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CatalogoComponent } from './catalogo.component';
import { CatalogoRoutingModule } from './catalogo-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    CatalogoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CatalogoRoutingModule,
    SharedModule,
    ToastrModule.forRoot()
  ]
})
export class CatalogoModule { }
