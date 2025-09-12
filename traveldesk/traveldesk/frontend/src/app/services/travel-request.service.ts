import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TravelRequest {
  requestId?: number;
  projectName: string;
  departmentName: string;
  reasonForTravelling: string;
  typeOfBooking: string;
  flightType?: string;
  dates?: string;
  aadhaarNumber?: string;
  passportNumber?: string;
  daysOfStay?: number;
  mealRequired?: string;
  mealPreference?: string;
  status: string;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class TravelRequestService {
  private apiUrl = 'http://localhost:5088/api'; // .NET backend URL

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return new HttpHeaders(headers);
  }

  // Employee endpoints
  createTravelRequest(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/employee/create-request`, request, {
      headers: this.getAuthHeaders()
    });
  }

  getMyRequests(): Observable<TravelRequest[]> {
    return this.http.get<TravelRequest[]>(`${this.apiUrl}/employee/my-requests`, {
      headers: this.getAuthHeaders()
    });
  }

  // Manager endpoints
  getPendingRequests(): Observable<TravelRequest[]> {
    return this.http.get<TravelRequest[]>(`${this.apiUrl}/manager/pending-requests`, {
      headers: this.getAuthHeaders()
    });
  }

  getApprovedRequests(): Observable<TravelRequest[]> {
    return this.http.get<TravelRequest[]>(`${this.apiUrl}/manager/my-requests`, {
      headers: this.getAuthHeaders()
    });
  }

  managerAction(requestId: number, actionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/manager/action-request/${requestId}`, actionData, {
      headers: this.getAuthHeaders()
    });
  }

  getManagerRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/manager/my-requests`, {
      headers: this.getAuthHeaders()
    });
  }

  approveRequest(requestId: number): Observable<any> {
    const actionDto = {
      action: 'approve',
      comments: 'Approved by manager'
    };
    return this.http.post(`${this.apiUrl}/manager/action-request/${requestId}`, actionDto, {
      headers: this.getAuthHeaders()
    });
  }

  returnRequest(requestId: number, comment: string): Observable<any> {
    const actionDto = {
      action: 'return to employee',
      comments: comment
    };
    return this.http.post(`${this.apiUrl}/manager/action-request/${requestId}`, actionDto, {
      headers: this.getAuthHeaders()
    });
  }

  // Travel Admin endpoints
  getAllRequests(): Observable<TravelRequest[]> {
    return this.http.get<TravelRequest[]>(`${this.apiUrl}/TravelAdmin/all-requests`, {
      headers: this.getAuthHeaders()
    });
  }

  // Travel Admin action (approve, book, complete, etc.)
  travelAdminAction(requestId: number, actionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/TravelAdmin/action-request/${requestId}`, actionData, {
      headers: this.getAuthHeaders()
    });
  }

  // Travel Admin approve (complete the request)
  adminApproveRequest(requestId: number): Observable<any> {
    const actionDto = {
      action: 'book ticket',
      comments: 'Request completed by travel admin'
    };
    return this.http.post(`${this.apiUrl}/TravelAdmin/action-request/${requestId}`, actionDto, {
      headers: this.getAuthHeaders()
    });
  }

  // Get documents for a specific request
  getRequestDocuments(requestId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/TravelAdmin/request-documents/${requestId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/users`, {
      headers: this.getAuthHeaders()
    });
  }

  addUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/add-user`, userData, {
      headers: this.getAuthHeaders()
    });
  }

  editUser(userId: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/edit-user/${userId}`, userData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/delete-user/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/profile`, {
      headers: this.getAuthHeaders()
    });
  }
}
