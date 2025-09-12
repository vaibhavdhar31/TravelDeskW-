import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { TravelAdminDashboard } from './travel-admin-dashboard';
import { EmailService } from '../../services/email.service';

describe('TravelAdminDashboard', () => {
  let component: TravelAdminDashboard;
  let fixture: ComponentFixture<TravelAdminDashboard>;
  let mockEmailService: jasmine.SpyObj<EmailService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('EmailService', ['sendRequestNotification']);

    await TestBed.configureTestingModule({
      imports: [
        TravelAdminDashboard,
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: EmailService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TravelAdminDashboard);
    component = fixture.componentInstance;
    mockEmailService = TestBed.inject(EmailService) as jasmine.SpyObj<EmailService>;
    
    // Mock service responses
    mockEmailService.sendRequestNotification.and.returnValue(of({ success: true }));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have requests array', () => {
    expect(component.requests).toBeDefined();
    expect(Array.isArray(component.requests)).toBeTruthy();
  });

  it('should have completed requests array', () => {
    expect(component.completedRequests).toBeDefined();
    expect(Array.isArray(component.completedRequests)).toBeTruthy();
  });

  it('should have loadApprovedRequests method', () => {
    expect(typeof component.loadApprovedRequests).toBe('function');
  });
});
