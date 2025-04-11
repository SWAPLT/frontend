import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenderVehiculoComponent } from './vender-vehiculo.component';

describe('VenderVehiculoComponent', () => {
  let component: VenderVehiculoComponent;
  let fixture: ComponentFixture<VenderVehiculoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VenderVehiculoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenderVehiculoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
