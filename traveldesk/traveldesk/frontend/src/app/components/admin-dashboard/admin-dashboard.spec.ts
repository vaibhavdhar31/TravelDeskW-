import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AdminDashboard } from './admin-dashboard';
import { EmailService } from '../../services/email.service';

describe('AdminDashboard', () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;
  let mockEmailService: jasmine.SpyObj<EmailService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('EmailService', ['sendRequestNotification']);

    await TestBed.configureTestingModule({
      imports: [
        AdminDashboard,
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: EmailService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboard);
    component = fixture.componentInstance;
    mockEmailService = TestBed.inject(EmailService) as jasmine.SpyObj<EmailService>;
    
    // Mock service responses
    mockEmailService.sendRequestNotification.and.returnValue(of({ success: true }));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have users array', () => {
    expect(component.users).toBeDefined();
    expect(Array.isArray(component.users)).toBeTruthy();
  });

  it('should have managers array', () => {
    expect(component.managers).toBeDefined();
    expect(Array.isArray(component.managers)).toBeTruthy();
  });
});
