import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleAdsComponent } from './google-ads.component';

describe('GoogleAdsComponent', () => {
  let component: GoogleAdsComponent;
  let fixture: ComponentFixture<GoogleAdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleAdsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
