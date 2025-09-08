import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { TravelRequestService } from '../../services/travel-request.service';

interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  roleId: number;
  employeeId: string;
  managerName: string;
  status?: string;
  manager?: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  pendingRequests: number;
  departments: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  activeSection: string = 'dashboard';

  stats: Stats = {
    totalUsers: 0,
    activeUsers: 0,
    pendingRequests: 0,
    departments: 0,
  };

  users: User[] = [];
  filteredUsers: User[] = [];
  isSubmitting = false;
  isModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  searchTerm = '';
  selectedDepartment = '';
  departments = ['IT', 'HR', 'Engineering', 'Sales', 'Marketing'];
  managers: any[] = [];;

  newUser = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    employeeId: '',
    department: '',
    roleId: 3,
    managerId: null
  };

  currentUser: User & { password?: string } = {
    userId: 0,
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: '',
    roleId: 3,
    employeeId: '',
    managerName: '',
    status: 'Active',
    manager: '',
    password: 'password123'
  };
  roleMapping: { [key: string]: number } = {
  'Admin': 3,
  'Travel Admin': 4, 
  'Employee': 1,
  'Manager': 2
};

  editingUser: User | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private travelRequestService: TravelRequestService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
  this.loadUsers();
  this.loadManagers(); // Add this line
}

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  onRoleChange() {
    console.log('Role changed to:', this.currentUser.role);
  if (this.currentUser.role && this.roleMapping[this.currentUser.role]) {
    this.currentUser.roleId = this.roleMapping[this.currentUser.role as keyof typeof this.roleMapping];
    console.log('RoleId set to:', this.currentUser.roleId);
  }
}


loadManagers() {
  // Get managers from existing users with Manager role
  this.travelRequestService.getAllUsers().subscribe({
    next: (response: any) => {
      let allUsers = [];
      if (Array.isArray(response)) {
        allUsers = response;
      } else if (response && response.users) {
        allUsers = response.users;
      } else if (response && response.Users) {
        allUsers = response.Users;
      }
      
      // Filter users with Manager role
      this.managers = allUsers
        .filter((user: any) => user.role === 'Manager' || user.roleId === 2)
        .map((manager: any) => ({
          UserId: manager.userId,
          Name: `${manager.firstName} ${manager.lastName}`
        }));
      
      console.log('Managers loaded:', this.managers);
    },
    error: (error: any) => {
      console.error('Error loading managers:', error);
      this.managers = [];
    }
  });
}


  loadUsers() {
    console.log('Loading users...');
    const token = localStorage.getItem('authToken');
    console.log('Token exists:', !!token);
    
    this.travelRequestService.getAllUsers().subscribe({
      next: (response) => {
        console.log('Users loaded successfully:', response);
        // Handle both direct array and object with users/Users property
        if (Array.isArray(response)) {
          this.users = response;
        } else if (response && response.users) {
          this.users = response.users; // lowercase 'users'
        } else if (response && response.Users) {
          this.users = response.Users; // uppercase 'Users'
        } else {
          this.users = [];
        }
        
        this.filteredUsers = [...this.users];
        this.stats.totalUsers = response.totalUsers || response.TotalUsers || this.users.length;
        this.stats.activeUsers = this.users.length;
        
        console.log('Users array:', this.users);
        console.log('Filtered users:', this.filteredUsers);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }

  addUser() {
    if (this.isSubmitting) return;
    
    console.log('Adding user:', this.newUser);
    this.isSubmitting = true;

    this.travelRequestService.addUser(this.newUser).subscribe({
      next: (response) => {
        console.log('User added successfully:', response);
        this.resetUserForm();
        this.loadUsers();
        this.closeModal();
        this.isSubmitting = false;
        alert('User added successfully!');
      },
      error: (error) => {
        console.error('Error adding user:', error);
        this.isSubmitting = false;
        alert('Error adding user: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }

  saveUser() {

  console.log('Before save - Role:', this.currentUser.role);
  console.log('Before save - RoleId:', this.currentUser.roleId);
    // Ensure roleId is set based on selected role
  if (this.currentUser.role && this.roleMapping[this.currentUser.role]) {
    this.currentUser.roleId = this.roleMapping[this.currentUser.role as keyof typeof this.roleMapping];
  }

  console.log('After mapping - RoleId:', this.currentUser.roleId);

    if (this.modalMode === 'add') {
      // Use currentUser data for adding
      const userData = {
        email: this.currentUser.email,
        password: this.currentUser.password || 'password123',
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        employeeId: this.currentUser.employeeId,
        department: this.currentUser.department,
        roleId: this.currentUser.roleId,
        managerId: null
      };
      console.log('Sending userData:', userData);
      this.addUserWithData(userData);
    } else {
      this.updateUser();
    }
  }

  addUserWithData(userData: any) {
    if (this.isSubmitting) return;
    
    console.log('Adding user:', userData);
    this.isSubmitting = true;

    this.travelRequestService.addUser(userData).subscribe({
      next: (response) => {
        console.log('User added successfully:', response);
        this.loadUsers();
        this.closeModal();
        this.isSubmitting = false;
        alert('User added successfully!');
      },
      error: (error) => {
        console.error('Error adding user:', error);
        this.isSubmitting = false;
        alert('Error adding user: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }

  editUser(user: User) {
    this.currentUser = { ...user };
    this.modalMode = 'edit';
    this.isModalOpen = true;
  }

  updateUser() {
    if (!this.currentUser || this.isSubmitting) return;
    
    this.isSubmitting = true;

    const updateData = {
      email: this.currentUser.email,
      firstName: this.currentUser.firstName,
      lastName: this.currentUser.lastName,
      employeeId: this.currentUser.employeeId,
      department: this.currentUser.department,
      roleId: this.currentUser.roleId
    };

    this.travelRequestService.editUser(this.currentUser.userId, updateData).subscribe({
      next: (response) => {
        console.log('User updated successfully:', response);
        this.loadUsers();
        this.closeModal();
        this.isSubmitting = false;
        alert('User updated successfully!');
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.isSubmitting = false;
        alert('Error updating user. Please try again.');
      }
    });
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.travelRequestService.deleteUser(userId).subscribe({
        next: (response) => {
          console.log('User deleted successfully:', response);
          this.loadUsers();
          alert('User deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Error deleting user. Please try again.');
        }
      });
    }
  }

  resetUserForm() {
    this.newUser = {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      employeeId: '',
      department: '',
      roleId: 3,
      managerId: null
    };
  }

  getEmptyUser(): User & { password?: string } {
    return {
      userId: 0,
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      role: '',
      roleId: 3,
      employeeId: '',
      managerName: '',
      status: 'Active',
      manager: '',
      password: 'password123'
    };
  }

  openAddUserModal() {
    this.currentUser = this.getEmptyUser();
    this.modalMode = 'add';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.currentUser = this.getEmptyUser();
  }

  closeAddUserModal() {
    this.closeModal();
  }

  openEditUserModal(user: User) {
    this.editUser(user);
  }

  closeEditUserModal() {
    this.closeModal();
  }

  onSearchChange() {
    this.filterUsers();
  }

  onDepartmentChange() {
    this.filterUsers();
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDepartment = !this.selectedDepartment || 
        user.department === this.selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }
  

  signOut() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }
}
