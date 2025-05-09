import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticasVehiculoComponent } from './estadisticas-vehiculo.component';

describe('EstadisticasVehiculoComponent', () => {
  let component: EstadisticasVehiculoComponent;
  let fixture: ComponentFixture<EstadisticasVehiculoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstadisticasVehiculoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticasVehiculoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
