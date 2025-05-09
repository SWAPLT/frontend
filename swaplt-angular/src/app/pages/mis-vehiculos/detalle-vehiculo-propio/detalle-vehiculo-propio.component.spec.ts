import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleVehiculoPropioComponent } from './detalle-vehiculo-propio.component';

describe('DetalleVehiculoPropioComponent', () => {
  let component: DetalleVehiculoPropioComponent;
  let fixture: ComponentFixture<DetalleVehiculoPropioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalleVehiculoPropioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleVehiculoPropioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
