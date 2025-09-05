import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { TravelRequestService, TravelRequest } from '../../services/travel-request.service';
import { EmailService } from '../../services/email.service';

interface Employee {
  id: string;
  name: string;
  department: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './employee-dashboard.html',
  styleUrls: ['./employee-dashboard.css'],
})
export class EmployeeDashboard implements OnInit {
  activeSection: string = 'dashboard';

  employee: Employee = {
    id: 'EMP001',
    name: 'Employee User',
    department: 'Engineering',
  };

  newRequest: any = {
    employeeId: 'E001',
    projectName: '',
    departmentName: this.employee.department,
    reasonForTravelling: '',
    typeOfBooking: 'Flight',
    flightType: '',
    dates: '',
    aadhaarNumber: '',
    passportNumber: '',
    visaFileUrl: '',
    passportFileUrl: '',
    daysOfStay: 0,
    mealRequired: 'No',
    mealPreference: ''
  };

  travelRequests: TravelRequest[] = [];
  history: TravelRequest[] = [];
  isSubmitting = false;
  uploadedFiles: File[] = [];
  showFlightFields = false;
  showHotelFields = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private travelRequestService: TravelRequestService,
    private emailService: EmailService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMyRequests();
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  loadMyRequests() {
    console.log('Loading requests...');
    
    this.travelRequestService.getMyRequests().subscribe({
      next: (requests) => {
        console.log('Requests loaded successfully:', requests);
        this.travelRequests = requests;
        this.history = requests;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.travelRequests = [];
        this.history = [];
      }
    });
  }

  submitRequest() {
    if (this.isSubmitting) return;
    
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please log in first to submit a request.');
      return;
    }
    
    console.log('Submitting request:', this.newRequest);
    this.isSubmitting = true;
    
    const requestData = {
      ...this.newRequest,
      status: 'Pending'
    };

    this.travelRequestService.createTravelRequest(requestData).subscribe({
      next: (response) => {
        console.log('Request created successfully:', response);
        
        // Send email notification to manager
        this.emailService.sendRequestNotification({
          requestId: response.requestId || 'TR' + Date.now(),
          employeeName: this.employee.name,
          managerEmail: 'manager@company.com',
          projectName: requestData.projectName,
          reasonForTravelling: requestData.reasonForTravelling
        }).subscribe({
          next: () => console.log('Email notification sent to manager'),
          error: (err) => console.warn('Email notification failed:', err)
        });
        
        this.resetForm();
        this.loadMyRequests();
        this.activeSection = 'history';
        this.isSubmitting = false;
        alert('Travel request submitted successfully! Your manager will be notified.');
      },
      error: (error) => {
        console.error('Error creating request:', error);
        console.error('Error details:', error.error);
        this.isSubmitting = false;
        alert('Error submitting request: ' + (error.error?.message || 'Please try again.'));
      }
    });
  }

  onBookingTypeChange(): void {
    this.showFlightFields = this.newRequest.bookingType === 'air' || this.newRequest.bookingType === 'both';
    this.showHotelFields = this.newRequest.bookingType === 'hotel' || this.newRequest.bookingType === 'both';
  }

  resetForm() {
    this.newRequest = {
      employeeId: 'E001',
      projectName: '',
      departmentName: this.employee.department,
      reasonForTravelling: '',
      typeOfBooking: 'Flight',
      flightType: '',
      dates: '',
      aadhaarNumber: '',
      passportNumber: '',
      visaFileUrl: '',
      passportFileUrl: '',
      daysOfStay: 0,
      mealRequired: 'No',
      mealPreference: ''
    };
    this.uploadedFiles = [];
    this.showFlightFields = false;
    this.showHotelFields = false;
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFilesSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      this.uploadedFiles = Array.from(files);
    }
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  editRequest(requestId: any): void {
    console.log('Edit request:', requestId);
    // Add edit functionality here
  }

  viewRequest(requestId: any): void {
    console.log('View request:', requestId);
    // Add view functionality here
  }

  signOut() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}
