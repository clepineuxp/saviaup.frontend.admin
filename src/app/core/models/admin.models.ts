export type HealthStatus = 'HEALTHY' | 'ATTENTION' | 'CRITICAL' | 'INACTIVE';
export type CashRegisterStatus = 'OPEN' | 'CLOSED' | 'NOT_REQUIRED';
export type PlanStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface AdminSession {
  readonly administrator: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
  };
  readonly accessToken: string;
  readonly expiresAt: string;
}

export interface MembershipSummary {
  readonly id: string;
  readonly organizationId: string;
  readonly organizationName: string;
  readonly roleCode: string;
  readonly roleName: string;
  readonly isActive: boolean;
  readonly disabledUntil: string | null;
}

export interface PlatformUser {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly lastAccessAt: string | null;
  readonly memberships: readonly MembershipSummary[];
}

export interface OwnerSummary {
  readonly userId: string;
  readonly name: string;
  readonly email: string;
}

export interface PlanSummary {
  readonly id: string;
  readonly name: string;
  readonly monthlyPrice: number;
  readonly currency: string;
}

export interface OrganizationSummary {
  readonly id: string;
  readonly name: string;
  readonly legalName: string;
  readonly slug: string;
  readonly isActive: boolean;
  readonly owner: OwnerSummary;
  readonly memberCount: number;
  readonly activePermissionCount: number;
  readonly totalPermissionCount: number;
  readonly plan: PlanSummary | null;
  readonly createdAt: string;
  readonly lastActivityAt: string | null;
  readonly health: HealthStatus;
}

export interface TenantPermission {
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly groupCode: string;
  readonly groupName: string;
  readonly enabled: boolean;
}

export interface OrganizationMember {
  readonly membershipId: string;
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly roleCode: string;
  readonly roleName: string;
  readonly isActive: boolean;
  readonly disabledUntil: string | null;
  readonly lastAccessAt: string | null;
}

export interface OrganizationDetail extends OrganizationSummary {
  readonly documentNumber: string;
  readonly contactEmail: string;
  readonly city: string;
  readonly permissions: readonly TenantPermission[];
  readonly members: readonly OrganizationMember[];
}

export interface OperationIssue {
  readonly severity: 'WARNING' | 'CRITICAL';
  readonly message: string;
}

export interface OrganizationOperation {
  readonly organizationId: string;
  readonly organizationName: string;
  readonly health: HealthStatus;
  readonly apiStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  readonly todaySales: number;
  readonly todayOrders: number;
  readonly averageTicket: number;
  readonly occupiedTables: number;
  readonly totalTables: number;
  readonly openCashRegisters: number;
  readonly cashRegisterStatus: CashRegisterStatus;
  readonly lastOrderAt: string | null;
  readonly issues: readonly OperationIssue[];
}

export interface PlatformPlan {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly monthlyPrice: number;
  readonly currency: string;
  readonly status: PlanStatus;
  readonly organizationCount: number;
  readonly includedPermissionCount: number;
}

export interface AuditEvent {
  readonly id: string;
  readonly action: string;
  readonly subject: string;
  readonly detail: string;
  readonly occurredAt: string;
  readonly kind: 'USER' | 'ORGANIZATION' | 'SECURITY' | 'OPERATION';
}

export interface DashboardSnapshot {
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly totalOrganizations: number;
  readonly activeOrganizations: number;
  readonly organizationsWithAlerts: number;
  readonly todayGrossVolume: number;
  readonly todayOrders: number;
  readonly monthlyRecurringRevenue: number;
  readonly organizationGrowth: number;
  readonly recentEvents: readonly AuditEvent[];
  readonly organizationHealth: readonly OrganizationOperation[];
}

export interface PasswordResetResult {
  readonly maskedEmail: string;
  readonly deliveryMode: 'DEVELOPMENT' | 'EMAIL';
}

export interface ReassignMembershipRequest {
  readonly userId: string;
  readonly membershipId: string;
  readonly targetOrganizationId: string;
}
