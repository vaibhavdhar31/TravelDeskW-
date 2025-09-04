import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../services/email.service';

interface TravelRequest {
  id: string;
  employee: string;
  manager: string;
  bookingType: string;
  approvedDate: string;
  status: 'Pending Travel Admin Approval' | 'Approved' | 'Disapproved' | 'Booked' | 'Completed' | 'Pending Booking';
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

  ngOnInit() {
    this.loadApprovedRequests();
    // Auto-refresh disabled to prevent overwriting status changes
    // setInterval(() => {
    //   this.loadApprovedRequests();
    // }, 30000);
  }

  loadApprovedRequests() {
    // Load approved requests from localStorage
    const travelAdminQueue = JSON.parse(localStorage.getItem('travelAdminQueue') || '[]');
    console.log('Travel Admin loading queue:', travelAdminQueue);
    
    this.requests = travelAdminQueue.map((req: any, index: number) => ({
      id: `TR${(index + 1).toString().padStart(3, '0')}`,
      employee: 'Employee User',
      manager: 'Manager User', 
      bookingType: req.typeOfBooking || 'Flight',
      approvedDate: req.approvedDate ? new Date(req.approvedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: (req.travelAdminStatus || 'Pending Travel Admin Approval') as 'Pending Travel Admin Approval' | 'Approved' | 'Disapproved' | 'Booked' | 'Completed'
    }));

    console.log('Travel Admin processed requests:', this.requests);

    // Update stats
    this.stats = {
      pendingTravelAdminApproval: this.requests.filter(r => r.status === 'Pending Travel Admin Approval').length,
      approvedRequests: this.requests.filter(r => r.status === 'Approved').length,
      disapproved: this.requests.filter(r => r.status === 'Disapproved').length,
      booked: this.requests.filter(r => r.status === 'Booked').length,
      pendingBooking: this.requests.filter(r => r.status === 'Pending Booking').length,
      completed: this.requests.filter(r => r.status === 'Completed').length,
    };

    // If no approved requests, show default mock data
    if (this.requests.length === 0) {
      this.requests = [
        {
          id: 'TR001',
          employee: 'No requests yet',
          manager: 'Submit and approve requests',
          bookingType: 'to see them here',
          approvedDate: new Date().toISOString().split('T')[0],
          status: 'Pending Travel Admin Approval',
        }
      ];
      this.stats.pendingTravelAdminApproval = 0;
    }

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

  constructor(private emailService: EmailService, private cdr: ChangeDetectorRef) {}

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
    console.log('🔧 Submit action called:', { 
      currentAction: this.currentAction, 
      currentRequestId: this.currentRequestId,
      modalComments: this.modalComments 
    });
    
    if (!this.modalComments.trim()) {
      alert('Comments are required for this action.');
      return;
    }

    const requestIndex = this.requests.findIndex((r) => r.id === this.currentRequestId);
    console.log('🔧 Found request index:', requestIndex, 'for ID:', this.currentRequestId);
    
    if (requestIndex !== -1) {
      let newStatus: string = '';
      
      console.log('🔧 Current request before action:', this.requests[requestIndex]);
      console.log('🔧 Action to perform:', this.currentAction);
      
      switch (this.currentAction) {
        case 'approve':
          // Travel admin approves the request
          console.log('🔧 Approving request:', this.requests[requestIndex]);
          this.requests[requestIndex].status = 'Approved';
          newStatus = 'Approved';
          this.updateStats('approve');
          console.log('🔧 Request approved, new status:', newStatus);
          
          // IMMEDIATELY update localStorage to prevent auto-refresh from overwriting
          const travelAdminQueue = JSON.parse(localStorage.getItem('travelAdminQueue') || '[]');
          const queueIndex = travelAdminQueue.findIndex((req: any) => 
            req.typeOfBooking === this.requests[requestIndex].bookingType
          );
          if (queueIndex !== -1) {
            travelAdminQueue[queueIndex].travelAdminStatus = 'Approved';
            localStorage.setItem('travelAdminQueue', JSON.stringify(travelAdminQueue));
            console.log('🔧 IMMEDIATELY updated localStorage for approve');
          }
          break;
        case 'disapprove':
          // Travel admin disapproves the request
          this.requests[requestIndex].status = 'Disapproved';
          newStatus = 'Disapproved';
          this.updateStats('disapprove');
          break;
        case 'book':
          // Only allow booking if already approved by travel admin
          console.log('🔧 Booking request:', this.requests[requestIndex]);
          console.log('🔧 Current status:', this.requests[requestIndex].status);
          
          if (this.requests[requestIndex].status !== 'Approved') {
            alert('Request must be approved by Travel Admin before booking.');
            console.log('❌ Booking failed - status is not Approved:', this.requests[requestIndex].status);
            return;
          }
          if (this.uploadedFiles.length === 0) {
            alert('Please upload tickets/documents for booking.');
            console.log('❌ Booking failed - no files uploaded');
            return;
          }
          this.requests[requestIndex].status = 'Booked';
          newStatus = 'Booked';
          this.updateStats('book');
          console.log('🔧 Request booked, new status:', newStatus);
          
          // IMMEDIATELY update localStorage to prevent auto-refresh from overwriting
          const travelAdminQueueBook = JSON.parse(localStorage.getItem('travelAdminQueue') || '[]');
          const queueIndexBook = travelAdminQueueBook.findIndex((req: any) => 
            req.typeOfBooking === this.requests[requestIndex].bookingType
          );
          if (queueIndexBook !== -1) {
            travelAdminQueueBook[queueIndexBook].travelAdminStatus = 'Booked';
            localStorage.setItem('travelAdminQueue', JSON.stringify(travelAdminQueueBook));
            console.log('🔧 IMMEDIATELY updated localStorage for book');
          }
          break;
        case 'complete':
          console.log('🔧 Completing request:', this.requests[requestIndex]);
          this.requests[requestIndex].status = 'Completed';
          newStatus = 'Completed';
          this.updateStats('complete');
          console.log('🔧 Request completed, new status:', newStatus);
          
          // IMMEDIATELY update localStorage to prevent auto-refresh from overwriting
          const travelAdminQueueComplete = JSON.parse(localStorage.getItem('travelAdminQueue') || '[]');
          const queueIndexComplete = travelAdminQueueComplete.findIndex((req: any) => 
            req.typeOfBooking === this.requests[requestIndex].bookingType
          );
          if (queueIndexComplete !== -1) {
            travelAdminQueueComplete[queueIndexComplete].travelAdminStatus = 'Completed';
            localStorage.setItem('travelAdminQueue', JSON.stringify(travelAdminQueueComplete));
            console.log('🔧 IMMEDIATELY updated localStorage for complete');
          }
          break;
        case 'returnManager':
          this.requests[requestIndex].status = 'Pending Travel Admin Approval';
          newStatus = 'Returned to Manager';
          break;
        default:
          console.error('🔧 Unknown action:', this.currentAction);
          alert('Unknown action: ' + this.currentAction);
          return;
      }

      // Get localStorage data and current request info
      const submittedRequests = JSON.parse(localStorage.getItem('submittedRequests') || '[]');
      const travelAdminQueue = JSON.parse(localStorage.getItem('travelAdminQueue') || '[]');
      const currentRequestData = this.requests[requestIndex];

      // Update travelAdminQueue with travel admin status FIRST
      const queueIndex = travelAdminQueue.findIndex((req: any) => 
        req.projectName === currentRequestData.bookingType
      );
      if (queueIndex !== -1) {
        travelAdminQueue[queueIndex].travelAdminStatus = this.requests[requestIndex].status;
        travelAdminQueue[queueIndex].travelAdminComments = this.modalComments;
        localStorage.setItem('travelAdminQueue', JSON.stringify(travelAdminQueue));
        console.log('Updated travelAdminQueue status to:', this.requests[requestIndex].status);
      } else {
        console.warn('Could not find request to update in travelAdminQueue');
      }

      // Sync status back to employee's view
      // Find and update the original request in submittedRequests by multiple criteria
      const originalRequestIndex = submittedRequests.findIndex((req: any, index: number) => {
        // Try to match by index first (most reliable for small datasets)
        const queueRequest = travelAdminQueue.find((q: any) => 
          q.projectName === req.projectName && 
          (q.travelAdminStatus === currentRequestData.status || 
           q.travelAdminStatus === 'Pending Travel Admin Approval' ||
           q.travelAdminStatus === 'Approved' ||
           q.travelAdminStatus === 'Booked')
        );
        return queueRequest !== undefined;
      });
      
      if (originalRequestIndex !== -1) {
        console.log('🔧 BEFORE update - submittedRequests[' + originalRequestIndex + ']:', submittedRequests[originalRequestIndex]);
        submittedRequests[originalRequestIndex].status = newStatus;
        submittedRequests[originalRequestIndex].travelAdminComments = this.modalComments;
        submittedRequests[originalRequestIndex].completedDate = new Date().toISOString();
        localStorage.setItem('submittedRequests', JSON.stringify(submittedRequests));
        console.log('🔧 AFTER update - submittedRequests[' + originalRequestIndex + ']:', submittedRequests[originalRequestIndex]);
        console.log('Updated employee request status to:', newStatus);
      } else {
        console.warn('Could not find original request to update in submittedRequests');
        console.log('🔧 Available submittedRequests:', submittedRequests);
        console.log('🔧 Looking for bookingType:', currentRequestData.bookingType);
      }

      // Send email notification to employee when completed
      if (this.currentAction === 'complete') {
        this.emailService.sendCompletionNotification({
          requestId: this.currentRequestId,
          employeeName: 'Employee User',
          employeeEmail: 'employee@company.com',
          travelAdminComments: this.modalComments
        }).subscribe({
          next: () => console.log('Completion email sent to employee'),
          error: (err) => console.warn('Email notification failed:', err)
        });
      }
    }

    console.log(`${this.currentAction} action performed on ${this.currentRequestId}`, {
      comments: this.modalComments,
      files: this.uploadedFiles.map((f) => f.name),
    });

    // Apply filters to show updated status (don't reload from localStorage)
    this.filterRequests();
    
    // Trigger change detection to update Booking History section
    this.cdr.detectChanges();
    console.log('🔧 Change detection triggered');
    
    this.closeModal();
    alert(`Request ${this.currentRequestId} ${this.getActionPastTense()} successfully!`);
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

  getCompletedRequests(): TravelRequest[] {
    const completedRequests = this.requests.filter(request => request.status === 'Completed');
    console.log('🔧 Getting completed requests:', completedRequests);
    console.log('🔧 All requests:', this.requests);
    console.log('🔧 Requests with status:', this.requests.map(r => ({ id: r.id, status: r.status })));
    return completedRequests;
  }

  signOut(): void {
    console.log('Sign out clicked');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  }
}
