import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');

  if (!token || !role) {
    router.navigate(['/login']);
    return false;
  }

  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      router.navigate(['/login']);
      return false;
    }
  } catch {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
