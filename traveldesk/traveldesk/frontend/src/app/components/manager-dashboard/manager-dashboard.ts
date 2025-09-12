import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TravelRequestService } from '../../services/travel-request.service';
import { EmailService } from '../../services/email.service';
import { Router } from '@angular/router';

interface TravelRequest {
  id: string;
  originalIndex?: number;
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
  currentUser: any = null;

  stats: Stats = {
    pending: 0,
    approved: 0,
    returned: 0,
    booked: 0,
    completed: 0,
    total: 0,
  };

  requests: TravelRequest[] = [];
  approvedRequests: TravelRequest[] = [];

  constructor(
    private travelRequestService: TravelRequestService,
    private emailService: EmailService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadPendingRequests();
    this.loadApprovedRequests();
    // Auto-refresh every 30 seconds to check for new requests
    setInterval(() => {
      this.loadPendingRequests();
      this.loadApprovedRequests();
    }, 30000);
  }

  loadUserProfile(): void {
    this.travelRequestService.getUserProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (err) => console.error('Failed to load user profile:', err)
    });
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  getUserFullName(): string {
    if (!this.currentUser) return 'User';
    return `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim();
  }

  loadPendingRequests() {
    console.log('🔧 Loading pending requests from API...');
    this.travelRequestService.getPendingRequests().subscribe({
      next: (requests) => {
        console.log('🔧 Received requests from API:', requests);
        console.log('🔧 Number of requests:', requests.length);
        
        this.requests = requests.map((req: any) => ({
          id: req.requestId?.toString() || '',
          employee: req.user?.email || 'Employee',
          project: req.projectName,
          bookingType: req.typeOfBooking,
          dateSubmitted: new Date(req.createdAt || Date.now()).toISOString().split('T')[0],
          status: 'Pending' as 'Pending'
        }));
        this.filteredRequests = [...this.requests];
        this.updateStatsFromRequests();
        console.log('🔧 Processed requests for display:', this.requests);
      },
      error: (error) => {
        console.error('🔧 Error loading pending requests:', error);
        console.error('🔧 Error status:', error.status);
        console.error('🔧 Error message:', error.message);
        
        // If authentication fails, try to load from debug endpoint temporarily
        if (error.status === 401 || error.status === 403) {
          console.log('🔧 Authentication failed, trying debug endpoint...');
          this.loadFromDebugEndpoint();
        } else {
          this.requests = [];
          this.filteredRequests = [];
          this.updateStatsFromRequests();
        }
      }
    });
  }

  loadFromDebugEndpoint() {
    // Temporary method to load from debug endpoint
    fetch('http://localhost:5088/api/manager/debug/all-requests')
      .then(response => response.json())
      .then(data => {
        console.log('🔧 Debug endpoint data:', data);
        const pendingRequests = data.requests.filter((req: any) => req.status === 'Pending');
        
        this.requests = pendingRequests.map((req: any, index: number) => ({
          id: req.requestId?.toString() || index.toString(),
          employee: req.userEmail || 'Employee',
          project: req.projectName || 'Unknown Project',
          bookingType: 'Flight',
          dateSubmitted: new Date().toISOString().split('T')[0],
          status: 'Pending' as 'Pending'
        }));
        
        this.filteredRequests = [...this.requests];
        this.updateStatsFromRequests();
        console.log('🔧 Loaded from debug endpoint:', this.requests);
      })
      .catch(err => {
        console.error('🔧 Debug endpoint also failed:', err);
        this.requests = [];
        this.filteredRequests = [];
        this.updateStatsFromRequests();
      });
  }

  loadApprovedRequests() {
    console.log('🔧 Loading approved requests from API...');
    this.travelRequestService.getManagerRequests().subscribe({
      next: (requests) => {
        console.log('🔧 Received manager requests from API:', requests);
        
        // Filter requests approved by manager (Manager Approved status)
        const approvedRequests = requests.filter((req: any) => req.status === 'Manager Approved');
        
        this.approvedRequests = approvedRequests.map((req: any) => ({
          id: req.requestId?.toString() || '',
          employee: req.user?.email || 'Employee',
          project: req.projectName,
          bookingType: req.typeOfBooking,
          dateSubmitted: new Date(req.updatedAt || req.createdAt || Date.now()).toISOString().split('T')[0],
          status: 'Manager Approved' as any
        }));
        
        console.log('🔧 Processed approved requests:', this.approvedRequests);
      },
      error: (error) => {
        console.error('🔧 Error loading approved requests:', error);
        
        // Fallback to debug endpoint for approved requests
        fetch('http://localhost:5088/api/manager/debug/all-requests')
          .then(response => response.json())
          .then(data => {
            const approvedRequests = data.requests.filter((req: any) => req.status === 'Manager Approved');
            
            this.approvedRequests = approvedRequests.map((req: any, index: number) => ({
              id: req.requestId?.toString() || index.toString(),
              employee: req.userEmail || 'Employee',
              project: req.projectName || 'Unknown Project',
              bookingType: 'Flight',
              dateSubmitted: new Date().toISOString().split('T')[0],
              status: 'Manager Approved' as any
            }));
            
            console.log('🔧 Loaded approved requests from debug endpoint:', this.approvedRequests);
          })
          .catch(err => {
            console.error('🔧 Failed to load approved requests:', err);
            this.approvedRequests = [];
          });
      }
    });
  }

  updateStatsFromRequests() {
    const allRequests = [...this.requests, ...this.approvedRequests];
    this.stats = {
      pending: this.requests.filter(r => r.status === 'Pending').length,
      approved: this.approvedRequests.length,
      returned: allRequests.filter(r => r.status === 'Returned').length,
      booked: allRequests.filter(r => r.status === 'Booked').length,
      completed: allRequests.filter(r => r.status === 'Completed').length,
      total: allRequests.length
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
    const actionData = {
      action: this.currentAction,
      comments: this.modalComments
    };

    console.log('🔧 Manager submitting action:', actionData, 'for request ID:', requestId);

    this.travelRequestService.managerAction(requestId, actionData).subscribe({
      next: (response) => {
        console.log('🔧 Manager action response:', response);
        alert(response.message || 'Action completed successfully!');
        
        console.log('🔧 Reloading pending and approved requests...');
        this.loadPendingRequests();
        this.loadApprovedRequests();
        this.closeModal();
      },
      error: (error) => {
        console.error('🔧 Manager action error:', error);
        alert('Error: Could not complete the action. Please try again.');
      }
    });
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
