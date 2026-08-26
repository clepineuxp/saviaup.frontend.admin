import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminSession } from '../models/admin.models';

export interface AdminAuthRepository {
  login(email: string, password: string): Observable<AdminSession>;
}

export const ADMIN_AUTH_REPOSITORY = new InjectionToken<AdminAuthRepository>(
  'ADMIN_AUTH_REPOSITORY',
);
