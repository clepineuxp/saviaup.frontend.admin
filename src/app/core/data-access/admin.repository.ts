import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
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

export interface AdminRepository {
  getDashboard(): Observable<DashboardSnapshot>;
  getUsers(): Observable<readonly PlatformUser[]>;
  getOrganizations(): Observable<readonly OrganizationSummary[]>;
  getOrganization(id: string): Observable<OrganizationDetail>;
  getOperations(): Observable<readonly OrganizationOperation[]>;
  getPlans(): Observable<readonly PlatformPlan[]>;
  setOrganizationStatus(id: string, isActive: boolean): Observable<OrganizationSummary>;
  setTenantPermission(
    organizationId: string,
    permissionCode: string,
    enabled: boolean,
  ): Observable<OrganizationDetail>;
  changeOwner(organizationId: string, userId: string): Observable<OrganizationDetail>;
  requestPasswordReset(userId: string): Observable<PasswordResetResult>;
  setMembershipStatus(membershipId: string, isActive: boolean): Observable<PlatformUser>;
  reassignMembership(request: ReassignMembershipRequest): Observable<PlatformUser>;
}

export const ADMIN_REPOSITORY = new InjectionToken<AdminRepository>('ADMIN_REPOSITORY');
