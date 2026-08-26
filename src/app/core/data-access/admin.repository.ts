import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DashboardSnapshot,
  OrganizationDetail,
  OrganizationOperation,
  OrganizationSummary,
  PasswordResetResult,
  PlanAssignmentResult,
  PlanDetail,
  PlanPermissionOption,
  PlatformPlan,
  PlatformUser,
  ReassignMembershipRequest,
  SavePlanRequest,
} from '../models/admin.models';

export interface AdminRepository {
  getDashboard(): Observable<DashboardSnapshot>;
  getUsers(): Observable<readonly PlatformUser[]>;
  getOrganizations(): Observable<readonly OrganizationSummary[]>;
  getOrganization(id: string): Observable<OrganizationDetail>;
  getOperations(): Observable<readonly OrganizationOperation[]>;
  getPlans(): Observable<readonly PlatformPlan[]>;
  getPlan(id: string): Observable<PlanDetail>;
  getPlanPermissionCatalog(): Observable<readonly PlanPermissionOption[]>;
  createPlan(request: SavePlanRequest): Observable<PlanDetail>;
  updatePlan(id: string, request: SavePlanRequest): Observable<PlanDetail>;
  setPlanStatus(id: string, status: PlatformPlan['status']): Observable<PlanDetail>;
  assignPlan(
    organizationId: string,
    planId: string,
    preserveOverrides?: boolean,
  ): Observable<PlanAssignmentResult>;
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
