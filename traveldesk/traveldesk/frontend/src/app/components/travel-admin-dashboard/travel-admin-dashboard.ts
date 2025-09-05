import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../services/email.service';
import { TravelRequestService } from '../../services/travel-request.service';

interface TravelRequest {
  id: string;
  employee: string;
  manager: string;
  bookingType: string;
  approvedDate: string;
  status: 'Pending Travel Admin Approval' | 'Approved' | 'Disapproved' | 'Booked' | 'Completed' | 'Pending Booking';
  originalId: number;
}

interface Stats {
  pendingTravelAdminApproval: number;
  approvedRequests: number;
  disapproved: number;
  booked: number;
  pendingBooking: number;
  completed: number;
}

@Component({
  selector: 'app-travel-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './travel-admin-dashboard.html',
  styleUrls: ['./travel-admin-dashboard.css'],
})
export class TravelAdminDashboard implements OnInit {
  activeSection: string = 'dashboard';

  stats: Stats = {
    pendingTravelAdminApproval: 0,
    approvedRequests: 0,
    disapproved: 0,
    booked: 0,
    pendingBooking: 0,
    completed: 0,
  };

  requests: TravelRequest[] = [];

  completedRequests: TravelRequest[] = [];

  ngOnInit() {
    console.log('🔧 Travel Admin dashboard initializing...');
    this.loadApprovedRequests();
    this.loadCompletedRequests();
    // Auto-refresh every 30 seconds (only active requests)
    setInterval(() => {
      this.loadApprovedRequests();
    }, 30000);
  }

  loadApprovedRequests() {
    console.log('🔧 Travel Admin loading requests from API...');
    
    this.travelRequestService.getAllRequests().subscribe({
      next: (requests: any) => {
        console.log('🔧 Travel Admin received requests:', requests);
        
        // Filter requests that need travel admin attention (Manager Approved, Approved, Booked)
        const travelAdminRequests = requests.filter((req: any) => 
          req.status === 'Manager Approved' || 
          req.status === 'Approved' || 
          req.status === 'Booked'
        );
        console.log('🔧 Travel Admin requests found:', travelAdminRequests.length);
        
        this.requests = travelAdminRequests.map((req: any) => {
          let displayStatus: any;
          switch(req.status) {
            case 'Manager Approved':
              displayStatus = 'Pending Travel Admin Approval';
              break;
            case 'Approved':
              displayStatus = 'Approved';
              break;
            case 'Booked':
              displayStatus = 'Booked';
              break;
            default:
              displayStatus = req.status;
          }
          
          return {
            id: `TR${req.requestId.toString().padStart(3, '0')}`,
            employee: req.user?.email || 'Employee User',
            manager: 'Manager User',
            bookingType: req.typeOfBooking || 'Flight',
            approvedDate: new Date(req.updatedAt || req.createdAt || Date.now()).toISOString().split('T')[0],
            status: displayStatus,
            originalId: req.requestId
          };
        });
        
        this.calculateStats();
        console.log('🔧 Travel Admin processed requests:', this.requests);
      },
      error: (error: any) => {
        console.error('🔧 Travel Admin error loading requests:', error);
        this.requests = [];
        this.calculateStats();
      }
    });
  }

  calculateStats() {
    this.stats = {
      pendingTravelAdminApproval: this.requests.filter(r => r.status === 'Pending Travel Admin Approval').length,
      approvedRequests: this.requests.filter(r => r.status === 'Approved').length,
      disapproved: this.requests.filter(r => r.status === 'Disapproved').length,
      booked: this.requests.filter(r => r.status === 'Booked').length,
      pendingBooking: this.requests.filter(r => r.status === 'Pending Booking').length,
      completed: this.requests.filter(r => r.status === 'Completed').length,
    };
    
    // Apply current filter after loading data
    this.filterRequests();
  }

  filteredRequests: TravelRequest[] = [];
  selectedStatus: string = 'All Requests';

  // Modal properties
  isModalOpen: boolean = false;
  currentRequestId: string = '';
  currentAction: string = '';
  modalComments: string = '';
  uploadedFiles: File[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private emailService: EmailService, 
    private cdr: ChangeDetectorRef,
    private travelRequestService: TravelRequestService
  ) {}

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  filterRequests(): void {
    console.log('Filtering requests with selectedStatus:', this.selectedStatus);
    console.log('Total requests:', this.requests.length);
    
    if (this.selectedStatus === 'All Requests') {
      this.filteredRequests = [...this.requests];
    } else {
      this.filteredRequests = this.requests.filter(
        (request) => request.status === this.selectedStatus,
      );
    }
    
    console.log('Filtered requests:', this.filteredRequests.length);
    console.log('Filtered requests data:', this.filteredRequests);
  }

  openActionModal(requestId: string, action: string): void {
    console.log('🔧 Opening action modal:', { requestId, action });
    this.currentRequestId = requestId;
    this.currentAction = action;
    this.modalComments = '';
    this.uploadedFiles = [];
    this.isModalOpen = true;
    console.log('🔧 Modal state:', { isModalOpen: this.isModalOpen, currentAction: this.currentAction });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentRequestId = '';
    this.currentAction = '';
    this.modalComments = '';
    this.uploadedFiles = [];
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFilesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.uploadedFiles.push(...files);
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  submitAction(): void {
    if (!this.modalComments.trim()) {
      alert('Comments are required for this action.');
      return;
    }

    const requestIndex = this.requests.findIndex((r) => r.id === this.currentRequestId);
    if (requestIndex === -1) {
      alert('Request not found.');
      return;
    }

    const request = this.requests[requestIndex];
    if (!request.originalId) {
      alert('Invalid request ID.');
      return;
    }

    const actionData = {
      action: this.currentAction,
      comments: this.modalComments
    };

    // Validate booking requirements
    if (this.currentAction === 'book' && this.uploadedFiles.length === 0) {
      alert('Please upload tickets/documents for booking.');
      return;
    }

    this.travelRequestService.travelAdminAction(request.originalId, actionData).subscribe({
      next: (response) => {
        console.log('🔧 Travel Admin action response:', response);
        
        // Update local status
        switch (this.currentAction) {
          case 'approve':
            request.status = 'Approved';
            this.updateStats('approve');
            break;
          case 'disapprove':
            request.status = 'Disapproved';
            this.updateStats('disapprove');
            break;
          case 'book':
            request.status = 'Booked';
            this.updateStats('book');
            break;
          case 'complete':
            request.status = 'Completed';
            this.updateStats('complete');
            // Add to completed requests for booking history
            this.completedRequests.push({...request});
            // Remove from active requests
            const requestIndex = this.requests.findIndex(r => r.id === request.id);
            if (requestIndex !== -1) {
              this.requests.splice(requestIndex, 1);
            }
            break;
        }

        this.filterRequests();
        this.closeModal();
        alert(`Request ${this.currentRequestId} ${this.getActionPastTense()} successfully!`);
      },
      error: (error) => {
        console.error('🔧 Travel Admin action error:', error);
        alert('Error processing request. Please try again.');
      }
    });
  }

  private updateStats(action: string): void {
    if (action === 'approve') {
      this.stats.pendingTravelAdminApproval--;
      this.stats.approvedRequests++;
    } else if (action === 'disapprove') {
      this.stats.pendingTravelAdminApproval--;
    } else if (action === 'book') {
      this.stats.approvedRequests--;
      this.stats.booked++;
    } else if (action === 'complete') {
      this.stats.booked--;
      this.stats.completed++;
    }
  }

  private getActionPastTense(): string {
    switch (this.currentAction) {
      case 'approve':
        return 'approved';
      case 'disapprove':
        return 'disapproved';
      case 'book':
        return 'booked';
      case 'complete':
        return 'completed';
      case 'returnManager':
        return 'returned to manager';
      default:
        return 'processed';
    }
  }

  getModalTitle(): string {
    switch (this.currentAction) {
      case 'approve':
        return 'Approve Travel Request';
      case 'disapprove':
        return 'Disapprove Travel Request';
      case 'book':
        return 'Book Travel Arrangement';
      case 'complete':
        return 'Complete Request';
      case 'returnManager':
        return 'Return to Manager';
      default:
        return 'Action Request';
    }
  }

  getSubmitButtonText(): string {
    switch (this.currentAction) {
      case 'approve':
        return 'Approve Request';
      case 'disapprove':
        return 'Disapprove Request';
      case 'book':
        return 'Complete Booking';
      case 'complete':
        return 'Mark Complete';
      case 'returnManager':
        return 'Return to Manager';
      default:
        return 'Submit';
    }
  }

  showUploadSection(): boolean {
    return this.currentAction === 'book';
  }

  viewBooking(requestId: string): void {
    alert(`View booking details for ${requestId}`);
  }

  viewDetails(requestId: string): void {
    alert(`View full details for ${requestId}`);
  }

  loadCompletedRequests() {
    this.travelRequestService.getAllRequests().subscribe({
      next: (requests: any) => {
        const completedRequests = requests.filter((req: any) => req.status === 'Completed');
        
        this.completedRequests = completedRequests.map((req: any) => ({
          id: `TR${req.requestId.toString().padStart(3, '0')}`,
          employee: req.user?.email || 'Employee User',
          manager: 'Manager User',
          bookingType: req.typeOfBooking || 'Flight',
          approvedDate: new Date(req.updatedAt || req.createdAt || Date.now()).toISOString().split('T')[0],
          status: 'Completed' as any,
          originalId: req.requestId
        }));
        
        console.log('✅ Booking history loaded:', this.completedRequests.length, 'completed requests');
      },
      error: (error: any) => {
        this.completedRequests = [];
      }
    });
  }

  getCompletedRequests(): TravelRequest[] {
    return this.completedRequests;
  }

  // Test method to verify booking history
  testBookingHistory(): void {
    console.log('🧪 TESTING BOOKING HISTORY');
    console.log('🧪 Current requests:', this.requests);
    console.log('🧪 Requests by status:');
    
    const statusCounts = {
      'Pending Travel Admin Approval': 0,
      'Approved': 0,
      'Booked': 0,
      'Completed': 0
    };
    
    this.requests.forEach(req => {
      statusCounts[req.status as keyof typeof statusCounts]++;
      console.log(`🧪 ${req.id}: ${req.status}`);
    });
    
    console.log('🧪 Status counts:', statusCounts);
    
    const completedRequests = this.getCompletedRequests();
    console.log('🧪 Completed requests for booking history:', completedRequests.length);
    console.log('🧪 Completed request details:', completedRequests);
    
    // Test if booking history section will show data
    if (completedRequests.length > 0) {
      console.log('✅ BOOKING HISTORY TEST PASSED - Has completed requests');
    } else {
      console.log('❌ BOOKING HISTORY TEST - No completed requests found');
      console.log('💡 To test: Complete a request by going through the full workflow');
    }
  }

  signOut(): void {
    console.log('Sign out clicked');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  }
}
