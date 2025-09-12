import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TravelRequestService, TravelRequest } from './travel-request.service';

describe('TravelRequestService', () => {
  let service: TravelRequestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TravelRequestService]
    });
    service = TestBed.inject(TravelRequestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get my requests', () => {
    const mockRequests: TravelRequest[] = [
      { 
        requestId: 1, 
        projectName: 'Test Project', 
        departmentName: 'IT',
        reasonForTravelling: 'Business',
        typeOfBooking: 'Flight',
        status: 'pending',
        userId: 1
      }
    ];

    service.getMyRequests().subscribe((requests: TravelRequest[]) => {
      expect(requests).toEqual(mockRequests);
    });

    const req = httpMock.expectOne('http://localhost:5088/api/employee/my-requests');
    expect(req.request.method).toBe('GET');
    req.flush(mockRequests);
  });

  it('should create travel request', () => {
    const mockRequest = {
      projectName: 'Test Project',
      departmentName: 'IT',
      reasonForTravelling: 'Business Meeting',
      typeOfBooking: 'Flight'
    };

    service.createTravelRequest(mockRequest).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:5088/api/employee/create-request');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should approve request', () => {
    const requestId = 1;

    service.approveRequest(requestId).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`http://localhost:5088/api/manager/action-request/${requestId}`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });
});
