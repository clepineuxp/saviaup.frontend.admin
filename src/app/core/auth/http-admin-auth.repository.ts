import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminSession } from '../models/admin.models';
import { AdminAuthRepository } from './admin-auth.repository';

@Injectable()
export class HttpAdminAuthRepository implements AdminAuthRepository {
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<AdminSession> {
    return this.http.post<AdminSession>(`${environment.apiBaseUrl}/api/admin/auth/login`, {
      email,
      password,
    });
  }
}
