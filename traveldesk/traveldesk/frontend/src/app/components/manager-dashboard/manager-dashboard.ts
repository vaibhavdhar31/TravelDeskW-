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
      if (this.activeSection === 'dashboard') {
        this.loadPendingRequests();
      } else if (this.activeSection === 'requests') {
        this.loadAssignedRequests();
      }
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
        this.requests = [];
        this.filteredRequests = [];
        this.updateStatsFromRequests();
      }
    });
  }

  loadAssignedRequests() {
    console.log('Loading assigned requests for manager...');
    this.travelRequestService.getManagerRequests().subscribe({
      next: (requests) => {
        console.log('Received assigned requests from API:', requests);
        // Filter to show only approved requests
        const approvedRequests = requests.filter(req => req.status === 'Approved');
        this.requests = approvedRequests.map(req => ({
          id: req.requestId?.toString() || '',
          employee: 'Employee',
          project: req.projectName,
          bookingType: req.typeOfBooking,
          dateSubmitted: new Date().toISOString().split('T')[0],
          status: req.status as 'Approved'
        }));
        this.filteredRequests = [...this.requests];
        this.updateStatsFromRequests();
        console.log('Processed approved requests:', this.requests);
      },
      error: (error) => {
        console.error('Error loading assigned requests:', error);
        this.requests = [];
        this.filteredRequests = [];
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
    if (section === 'requests') {
      this.loadAssignedRequests(); // Load approved requests
    } else if (section === 'dashboard') {
      this.loadPendingRequests(); // Load pending requests
    }
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
      // Call the .NET API to approve the request
      const actionDto = {
        action: 'approve',
        comments: this.modalComments
      };
      
      this.travelRequestService.approveRequest(requestId).subscribe({
        next: (response) => {
          console.log('Request approved successfully:', response);
          alert('Request approved successfully! Sent to Travel Admin for final confirmation.');
          this.loadPendingRequests(); // Reload pending requests
          this.closeModal();
        },
        error: (error) => {
          console.error('Error approving request:', error);
          alert('Error approving request. Please try again.');
        }
      });
    } else if (this.currentAction === 'return') {
      // Call the .NET API to return the request
      this.travelRequestService.returnRequest(requestId, this.modalComments).subscribe({
        next: (response) => {
          console.log('Request returned successfully:', response);
          alert('Request returned to employee for revision.');
          this.loadPendingRequests(); // Reload data
          this.closeModal();
        },
        error: (error) => {
          console.error('Error returning request:', error);
          alert('Error returning request. Please try again.');
        }
      });
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
