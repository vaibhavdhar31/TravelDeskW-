import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ManagerDashboard } from './manager-dashboard';
import { TravelRequestService } from '../../services/travel-request.service';

describe('ManagerDashboard', () => {
  let component: ManagerDashboard;
  let fixture: ComponentFixture<ManagerDashboard>;
  let mockTravelService: jasmine.SpyObj<TravelRequestService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TravelRequestService', ['getPendingRequests', 'approveRequest', 'getUserProfile', 'getManagerRequests']);

    await TestBed.configureTestingModule({
      imports: [
        ManagerDashboard,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: TravelRequestService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerDashboard);
    component = fixture.componentInstance;
    mockTravelService = TestBed.inject(TravelRequestService) as jasmine.SpyObj<TravelRequestService>;
    
    // Mock service responses
    mockTravelService.getPendingRequests.and.returnValue(of([]));
    mockTravelService.getManagerRequests.and.returnValue(of([]));
    mockTravelService.approveRequest.and.returnValue(of({ success: true }));
    mockTravelService.getUserProfile.and.returnValue(of({ firstName: 'Test', lastName: 'Manager' }));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have requests array', () => {
    expect(component.requests).toBeDefined();
    expect(Array.isArray(component.requests)).toBeTruthy();
  });

  it('should have approved requests array', () => {
    expect(component.approvedRequests).toBeDefined();
    expect(Array.isArray(component.approvedRequests)).toBeTruthy();
  });

  it('should have loadPendingRequests method', () => {
    expect(typeof component.loadPendingRequests).toBe('function');
  });
});
