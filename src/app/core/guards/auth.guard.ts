import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthStore } from '../auth/admin-auth.store';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthStore);
  return auth.isAuthenticated() ? true : inject(Router).createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthStore);
  return auth.isAuthenticated() ? inject(Router).createUrlTree(['/dashboard']) : true;
};
