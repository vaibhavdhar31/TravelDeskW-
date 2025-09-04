import { Routes } from '@angular/router';
import { Login } from './login/login';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { ManagerDashboard } from './components/manager-dashboard/manager-dashboard';
import { EmployeeDashboard } from './components/employee-dashboard/employee-dashboard';
import { TravelAdminDashboard } from './components/travel-admin-dashboard/travel-admin-dashboard';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard, roleGuard(['admin'])],
  },
  {
    path: 'manager',
    component: ManagerDashboard,
    canActivate: [authGuard, roleGuard(['manager'])],
  },
  {
    path: 'employee',
    component: EmployeeDashboard,
    canActivate: [authGuard, roleGuard(['employee'])],
  },
  {
    path: 'travel-admin',
    component: TravelAdminDashboard,
    canActivate: [authGuard, roleGuard(['travel-admin'])],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
