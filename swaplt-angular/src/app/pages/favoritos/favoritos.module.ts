import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritosComponent } from './favoritos.component';
import { SharedModule } from '../../shared/shared.module';
import { FavoritosRoutingModule } from './favoritos-routing.module';

@NgModule({
  declarations: [
    FavoritosComponent
  ],
  imports: [
    CommonModule,
    FavoritosRoutingModule,
    SharedModule
  ]
})
export class FavoritosModule { } 