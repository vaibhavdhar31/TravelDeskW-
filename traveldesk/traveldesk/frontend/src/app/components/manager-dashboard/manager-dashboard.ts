import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TravelRequestService } from '../../services/travel-request.service';
import { EmailService } from '../../services/email.service';
import { Router } from '@angular/router';

interface TravelRequest {
  id: string;
  employee: string;
  project: string;
  bookingType: string;
  dateSubmitted: string;
  status: 'Pending' | 'Approved' | 'Returned' | 'Booked' | 'Completed';
}

interface Stats {
  pending: number;
  approved: number;
  returned: number;
  booked: number;
  completed: number;
  total: number;
}

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-dashboard.html',
  styleUrl: './manager-dashboard.css',
})
export class ManagerDashboard implements OnInit {
  activeSection: string = 'dashboard';

  stats: Stats = {
    pending: 0,
    approved: 0,
    returned: 0,
    booked: 0,
    completed: 0,
    total: 0,
  };

  requests: TravelRequest[] = [];

  constructor(
    private travelRequestService: TravelRequestService,
    private emailService: EmailService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPendingRequests();
    // Auto-refresh every 30 seconds to check for new requests
    setInterval(() => {
      this.loadPendingRequests();
    }, 30000);
  }

  loadPendingRequests() {
    console.log('Loading pending requests for manager...');
    this.travelRequestService.getPendingRequests().subscribe({
      next: (requests) => {
        console.log('Received requests from API:', requests);
        this.requests = requests.map(req => ({
          id: req.requestId?.toString() || '',
          employee: 'Employee',
          project: req.projectName,
          bookingType: req.typeOfBooking,
          dateSubmitted: new Date().toISOString().split('T')[0],
          status: req.status as 'Pending' | 'Approved' | 'Returned'
        }));
        this.filteredRequests = [...this.requests];
        this.updateStatsFromRequests();
        console.log('Processed requests:', this.requests);
      },
      error: (error) => {
        console.error('Error loading pending requests:', error);
        if (error.status === 404) {
          console.warn('Manager API endpoint not found. Using mock data.');
          // Get submitted requests from localStorage
          const submittedRequests = JSON.parse(localStorage.getItem('submittedRequests') || '[]');
          console.log('🔧 Manager loading submittedRequests:', submittedRequests);
          
          this.requests = submittedRequests
            .map((req: any, index: number) => {
              console.log('🔧 Processing request:', req.projectName, 'Status:', req.status);
              return {
                id: (index + 1).toString(),
                employee: 'Employee User',
                project: req.projectName || 'Unknown Project',
                bookingType: req.typeOfBooking || 'Flight',
                dateSubmitted: new Date().toISOString().split('T')[0],
                status: req.status as 'Pending' | 'Approved' | 'Returned' | 'Booked' | 'Completed'
              };
            });
          
          console.log('🔧 Manager processed requests:', this.requests);
          
          // If no submitted requests, show default mock data
          if (this.requests.length === 0) {
            this.requests = [
              {
                id: '1',
                employee: 'John Doe',
                project: 'Project Alpha',
                bookingType: 'Flight',
                dateSubmitted: '2024-08-31',
                status: 'Pending' as 'Pending'
              }
            ];
          }
        } else {
          this.requests = [];
        }
        this.filteredRequests = [...this.requests];
        this.updateStatsFromRequests();
      }
    });
  }

  updateStatsFromRequests() {
    this.stats = {
      pending: this.requests.filter(r => r.status === 'Pending').length,
      approved: this.requests.filter(r => r.status === 'Approved').length,
      returned: this.requests.filter(r => r.status === 'Returned').length,
      booked: this.requests.filter(r => r.status === 'Booked').length,
      completed: this.requests.filter(r => r.status === 'Completed').length,
      total: this.requests.length
    };
  }

  filteredRequests: TravelRequest[] = [...this.requests];
  selectedStatus: string = '';

  // Modal properties
  isModalOpen: boolean = false;
  currentRequestId: string = '';
  currentAction: string = '';
  modalComments: string = '';

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  signOut(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  filterRequests(): void {
    if (this.selectedStatus) {
      this.filteredRequests = this.requests.filter(
        (request) => request.status === this.selectedStatus,
      );
    } else {
      this.filteredRequests = [...this.requests];
    }
  }

  openActionModal(requestId: string, action: string): void {
    this.currentRequestId = requestId;
    this.currentAction = action;
    this.modalComments = '';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentRequestId = '';
    this.currentAction = '';
    this.modalComments = '';
  }

  getModalTitle(): string {
    switch (this.currentAction) {
      case 'approve':
        return 'Approve Request';
      case 'disapprove':
        return 'Disapprove Request';
      case 'return':
        return 'Return Request';
      default:
        return 'Action Request';
    }
  }

  getActionButtonText(): string {
    switch (this.currentAction) {
      case 'approve':
        return 'Approve';
      case 'disapprove':
        return 'Disapprove';
      case 'return':
        return 'Return';
      default:
        return 'Submit';
    }
  }

  submitAction(): void {
    if (!this.modalComments.trim()) {
      return;
    }

    const requestId = parseInt(this.currentRequestId);
    
    if (this.currentAction === 'approve') {
      // Handle approval locally since backend is not available
      const submittedRequests = JSON.parse(localStorage.getItem('submittedRequests') || '[]');
      
      // Find the request by matching the displayed request data
      const currentRequest = this.requests.find(r => r.id === this.currentRequestId);
      const requestIndex = submittedRequests.findIndex((req: any) => 
        req.projectName === currentRequest?.project && req.status === 'Pending'
      );
      
      if (requestIndex !== -1) {
        submittedRequests[requestIndex].status = 'Approved';
        submittedRequests[requestIndex].managerComments = this.modalComments;
        submittedRequests[requestIndex].approvedDate = new Date().toISOString();
        localStorage.setItem('submittedRequests', JSON.stringify(submittedRequests));
        
        // Move to travel admin queue
        const travelAdminQueue = JSON.parse(localStorage.getItem('travelAdminQueue') || '[]');
        const requestForTravelAdmin = {
          ...submittedRequests[requestIndex],
          travelAdminStatus: 'Pending Travel Admin Approval'  // Set initial status for travel admin
        };
        travelAdminQueue.push(requestForTravelAdmin);
        localStorage.setItem('travelAdminQueue', JSON.stringify(travelAdminQueue));
        
        console.log('Request moved to travel admin queue:', requestForTravelAdmin);
        
        // Send email notification to travel admin
        this.emailService.sendApprovalNotification({
          requestId: this.currentRequestId,
          employeeName: 'Employee User',
          travelAdminEmail: 'traveladmin@company.com',
          managerComments: this.modalComments
        }).subscribe({
          next: () => console.log('Email notification sent to travel admin'),
          error: (err) => console.warn('Email notification failed:', err)
        });
        
        alert('Request approved successfully! Sent to Travel Admin for final confirmation.');
      } else {
        console.error('Could not find request to approve');
        alert('Error: Could not find the request to approve.');
      }
      
      this.loadPendingRequests(); // Reload data
      this.closeModal();
    } else if (this.currentAction === 'return') {
      // Handle return locally
      const submittedRequests = JSON.parse(localStorage.getItem('submittedRequests') || '[]');
      
      // Find the request by matching the displayed request data
      const currentRequest = this.requests.find(r => r.id === this.currentRequestId);
      const requestIndex = submittedRequests.findIndex((req: any) => 
        req.projectName === currentRequest?.project && req.status === 'Pending'
      );
      
      if (requestIndex !== -1) {
        submittedRequests[requestIndex].status = 'Returned';
        submittedRequests[requestIndex].managerComments = this.modalComments;
        localStorage.setItem('submittedRequests', JSON.stringify(submittedRequests));
        
        alert('Request returned to employee for revision.');
      } else {
        console.error('Could not find request to return');
        alert('Error: Could not find the request to return.');
      }
      
      this.loadPendingRequests(); // Reload data
      this.closeModal();
    }
  }

  private updateStats(action: string): void {
    if (action === 'approve') {
      this.stats.pending--;
      this.stats.approved++;
    } else if (action === 'return') {
      this.stats.pending--;
      this.stats.returned++;
    } 
  }
}
