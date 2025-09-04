import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelAdminDashboard } from './travel-admin-dashboard';

describe('TravelAdminDashboard', () => {
  let component: TravelAdminDashboard;
  let fixture: ComponentFixture<TravelAdminDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelAdminDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(TravelAdminDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
