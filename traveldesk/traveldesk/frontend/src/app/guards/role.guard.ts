import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const userRole = localStorage.getItem('userRole');

    // Check if user has required role
    if (!userRole || !allowedRoles.includes(userRole)) {
      router.navigate(['/login']);
      return false;
    }

    return true;
  };
};
