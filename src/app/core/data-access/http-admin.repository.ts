import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DashboardSnapshot,
  OrganizationDetail,
  OrganizationOperation,
  OrganizationSummary,
  PasswordResetResult,
  PlatformPlan,
  PlatformUser,
  ReassignMembershipRequest,
} from '../models/admin.models';
import { AdminRepository } from './admin.repository';

@Injectable()
export class HttpAdminRepository implements AdminRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/admin`;

  getDashboard(): Observable<DashboardSnapshot> {
    return this.http.get<DashboardSnapshot>(`${this.baseUrl}/dashboard`);
  }

  getUsers(): Observable<readonly PlatformUser[]> {
    return this.http.get<readonly PlatformUser[]>(`${this.baseUrl}/users`);
  }

  getOrganizations(): Observable<readonly OrganizationSummary[]> {
    return this.http.get<readonly OrganizationSummary[]>(`${this.baseUrl}/organizations`);
  }

  getOrganization(id: string): Observable<OrganizationDetail> {
    return this.http.get<OrganizationDetail>(`${this.baseUrl}/organizations/${id}`);
  }

  getOperations(): Observable<readonly OrganizationOperation[]> {
    return this.http.get<readonly OrganizationOperation[]>(`${this.baseUrl}/operations`);
  }

  getPlans(): Observable<readonly PlatformPlan[]> {
    return this.http.get<readonly PlatformPlan[]>(`${this.baseUrl}/plans`);
  }

  setOrganizationStatus(id: string, isActive: boolean): Observable<OrganizationSummary> {
    return this.http.patch<OrganizationSummary>(`${this.baseUrl}/organizations/${id}/status`, {
      isActive,
    });
  }

  setTenantPermission(
    organizationId: string,
    permissionCode: string,
    enabled: boolean,
  ): Observable<OrganizationDetail> {
    return this.http.patch<OrganizationDetail>(
      `${this.baseUrl}/organizations/${organizationId}/permissions/${permissionCode}`,
      { enabled },
    );
  }

  changeOwner(organizationId: string, userId: string): Observable<OrganizationDetail> {
    return this.http.put<OrganizationDetail>(
      `${this.baseUrl}/organizations/${organizationId}/owner`,
      { userId },
    );
  }

  requestPasswordReset(userId: string): Observable<PasswordResetResult> {
    return this.http.post<PasswordResetResult>(
      `${this.baseUrl}/users/${userId}/password-reset`,
      {},
    );
  }

  setMembershipStatus(membershipId: string, isActive: boolean): Observable<PlatformUser> {
    return this.http.patch<PlatformUser>(`${this.baseUrl}/memberships/${membershipId}/status`, {
      isActive,
    });
  }

  reassignMembership(request: ReassignMembershipRequest): Observable<PlatformUser> {
    return this.http.post<PlatformUser>(`${this.baseUrl}/memberships/reassign`, request);
  }
}
