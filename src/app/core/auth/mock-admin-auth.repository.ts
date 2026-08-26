import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { AdminSession } from '../models/admin.models';
import { AdminAuthRepository } from './admin-auth.repository';

const DEVELOPMENT_EMAIL = 'admin@saviaup.local';
const DEVELOPMENT_PASSWORD = 'Savia123*';

@Injectable()
export class MockAdminAuthRepository implements AdminAuthRepository {
  login(email: string, password: string): Observable<AdminSession> {
    if (email.trim().toLowerCase() !== DEVELOPMENT_EMAIL || password !== DEVELOPMENT_PASSWORD) {
      return throwError(() => new Error('ADMIN_INVALID_CREDENTIALS'));
    }

    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    return of({
      administrator: {
        id: 'admin-local',
        name: 'Administrador SaviaUp',
        email: DEVELOPMENT_EMAIL,
      },
      accessToken: 'local-admin-session',
      expiresAt,
    }).pipe(delay(450));
  }
}
