import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'http://localhost:5088/api/email';

  constructor(private http: HttpClient) {}

  sendRequestNotification(requestData: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true });
        observer.complete();
      }, 500);
    });
  }

  sendApprovalNotification(requestData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-approved`, {
      to: requestData.travelAdminEmail,
      subject: `Travel Request Approved - ${requestData.requestId}`,
      requestId: requestData.requestId,
      employeeName: requestData.employeeName,
      managerComments: requestData.managerComments
    });
  }

  sendStatusUpdate(requestData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/status-update`, {
      to: requestData.employeeEmail,
      subject: `Travel Request Update - ${requestData.requestId}`,
      requestId: requestData.requestId,
      status: requestData.status,
      comments: requestData.comments
    });
  }

  sendCompletionNotification(requestData: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        console.log('Sending completion notification to employee:', requestData);
        observer.next({ success: true });
        observer.complete();
      }, 500);
    });
  }
}
