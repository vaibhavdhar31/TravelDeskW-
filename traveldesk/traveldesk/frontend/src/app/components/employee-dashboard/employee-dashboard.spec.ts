import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { EmployeeDashboard } from './employee-dashboard';
import { TravelRequestService } from '../../services/travel-request.service';

describe('EmployeeDashboard', () => {
  let component: EmployeeDashboard;
  let fixture: ComponentFixture<EmployeeDashboard>;
  let mockTravelService: jasmine.SpyObj<TravelRequestService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TravelRequestService', ['getMyRequests', 'createTravelRequest', 'getUserProfile']);

    await TestBed.configureTestingModule({
      imports: [
        EmployeeDashboard,
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: TravelRequestService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeDashboard);
    component = fixture.componentInstance;
    mockTravelService = TestBed.inject(TravelRequestService) as jasmine.SpyObj<TravelRequestService>;
    
    // Mock service responses
    mockTravelService.getMyRequests.and.returnValue(of([]));
    mockTravelService.getUserProfile.and.returnValue(of({ firstName: 'Test', lastName: 'User' }));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load requests on init', () => {
    expect(mockTravelService.getMyRequests).toHaveBeenCalled();
  });

  it('should have travel requests array', () => {
    expect(component.travelRequests).toBeDefined();
    expect(Array.isArray(component.travelRequests)).toBeTruthy();
  });

  it('should have new request object', () => {
    expect(component.newRequest).toBeDefined();
    expect(component.newRequest.projectName).toBe('');
  });
});
