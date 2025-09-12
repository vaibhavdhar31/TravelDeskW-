import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmailService]
    });
    service = TestBed.inject(EmailService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send request notification', () => {
    const requestData = { requestId: 1, employeeName: 'John Doe' };

    service.sendRequestNotification(requestData).subscribe(response => {
      expect(response.success).toBeTruthy();
    });
  });

  it('should send approval notification', () => {
    const requestData = {
      travelAdminEmail: 'admin@example.com',
      requestId: 1,
      employeeName: 'John Doe',
      managerComments: 'Approved'
    };

    service.sendApprovalNotification(requestData).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:5088/api/email/request-approved');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should send status update', () => {
    const requestData = {
      employeeEmail: 'employee@example.com',
      requestId: 1,
      status: 'approved',
      comments: 'Request approved'
    };

    service.sendStatusUpdate(requestData).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:5088/api/email/status-update');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });
});
