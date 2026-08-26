import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  DashboardSnapshot,
  OrganizationDetail,
  OrganizationOperation,
  OrganizationMember,
  OrganizationSummary,
  PlanDetail,
  PlanPermissionOption,
  PlatformPlan,
  PlatformUser,
  ReassignMembershipRequest,
  SavePlanRequest,
} from '../models/admin.models';
import { ADMIN_REPOSITORY } from '../data-access/admin.repository';

export interface AdminNotice {
  readonly tone: 'SUCCESS' | 'ERROR';
  readonly message: string;
}

@Injectable({ providedIn: 'root' })
export class AdminStore {
  private readonly repository = inject(ADMIN_REPOSITORY);
  private readonly dashboardState = signal<DashboardSnapshot | null>(null);
  private readonly usersState = signal<readonly PlatformUser[]>([]);
  private readonly organizationsState = signal<readonly OrganizationSummary[]>([]);
  private readonly organizationState = signal<OrganizationDetail | null>(null);
  private readonly operationsState = signal<readonly OrganizationOperation[]>([]);
  private readonly plansState = signal<readonly PlatformPlan[]>([]);
  private readonly planDetailState = signal<PlanDetail | null>(null);
  private readonly planPermissionCatalogState = signal<readonly PlanPermissionOption[]>([]);
  private readonly loadingState = signal(false);
  private readonly pendingActionState = signal<string | null>(null);
  private readonly errorState = signal<string | null>(null);
  private readonly noticeState = signal<AdminNotice | null>(null);

  readonly dashboard = this.dashboardState.asReadonly();
  readonly users = this.usersState.asReadonly();
  readonly organizations = this.organizationsState.asReadonly();
  readonly organization = this.organizationState.asReadonly();
  readonly operations = this.operationsState.asReadonly();
  readonly plans = this.plansState.asReadonly();
  readonly planDetail = this.planDetailState.asReadonly();
  readonly planPermissionCatalog = this.planPermissionCatalogState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly pendingAction = this.pendingActionState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly notice = this.noticeState.asReadonly();

  async loadDashboard(): Promise<void> {
    await this.load(() => firstValueFrom(this.repository.getDashboard()), this.dashboardState);
  }

  async loadUsers(): Promise<void> {
    await this.load(() => firstValueFrom(this.repository.getUsers()), this.usersState);
  }

  async loadOrganizations(): Promise<void> {
    await this.load(
      () => firstValueFrom(this.repository.getOrganizations()),
      this.organizationsState,
    );
  }

  async loadOrganization(id: string): Promise<void> {
    this.organizationState.set(null);
    await this.load(
      () => firstValueFrom(this.repository.getOrganization(id)),
      this.organizationState,
    );
  }

  async loadOperations(): Promise<void> {
    await this.load(() => firstValueFrom(this.repository.getOperations()), this.operationsState);
  }

  async loadPlans(): Promise<void> {
    await this.load(() => firstValueFrom(this.repository.getPlans()), this.plansState);
  }

  async loadPlan(id: string): Promise<void> {
    this.planDetailState.set(null);
    await this.load(() => firstValueFrom(this.repository.getPlan(id)), this.planDetailState);
  }

  async loadPlanPermissionCatalog(): Promise<void> {
    await this.load(
      () => firstValueFrom(this.repository.getPlanPermissionCatalog()),
      this.planPermissionCatalogState,
    );
  }

  clearPlanDetail(): void {
    this.planDetailState.set(null);
  }

  async savePlan(request: SavePlanRequest, id?: string): Promise<void> {
    await this.action(
      id ? `plan-update:${id}` : 'plan-create',
      async () => {
        const saved = await firstValueFrom(
          id ? this.repository.updatePlan(id, request) : this.repository.createPlan(request),
        );
        this.planDetailState.set(saved);
        await this.loadPlans();
      },
      id
        ? 'El plan fue actualizado y sus organizaciones quedaron sincronizadas.'
        : 'El plan fue creado.',
    );
  }

  async setPlanStatus(plan: PlatformPlan, status: PlatformPlan['status']): Promise<void> {
    await this.action(
      `plan-status:${plan.id}`,
      async () => {
        await firstValueFrom(this.repository.setPlanStatus(plan.id, status));
        await this.loadPlans();
      },
      `El plan quedó en estado ${status === 'ACTIVE' ? 'activo' : status === 'DRAFT' ? 'borrador' : 'archivado'}.`,
    );
  }

  async assignPlan(planId: string): Promise<void> {
    const organization = this.organizationState();
    if (!organization) return;
    await this.action(
      `assign-plan:${organization.id}`,
      async () => {
        await firstValueFrom(this.repository.assignPlan(organization.id, planId));
        this.organizationState.set(
          await firstValueFrom(this.repository.getOrganization(organization.id)),
        );
      },
      'El plan fue asignado y los permisos efectivos quedaron sincronizados.',
    );
  }

  async setOrganizationStatus(organization: OrganizationSummary): Promise<void> {
    await this.action(
      `organization-status:${organization.id}`,
      async () => {
        const updated = await firstValueFrom(
          this.repository.setOrganizationStatus(organization.id, !organization.isActive),
        );
        this.organizationsState.update((items) =>
          items.map((item) => (item.id === updated.id ? updated : item)),
        );
      },
      organization.isActive
        ? `${organization.name} fue desactivada.`
        : `${organization.name} fue reactivada.`,
    );
  }

  async setTenantPermission(code: string, enabled: boolean): Promise<void> {
    const organization = this.organizationState();
    if (!organization) return;
    await this.action(
      `permission:${code}`,
      async () => {
        const updated = await firstValueFrom(
          this.repository.setTenantPermission(organization.id, code, enabled),
        );
        this.organizationState.set(updated);
      },
      enabled ? 'Permiso habilitado para la organización.' : 'Permiso deshabilitado.',
    );
  }

  async changeOwner(userId: string): Promise<void> {
    const organization = this.organizationState();
    if (!organization || organization.owner.userId === userId) return;
    await this.action(
      'change-owner',
      async () => {
        const updated = await firstValueFrom(this.repository.changeOwner(organization.id, userId));
        this.organizationState.set(updated);
        this.organizationsState.update((items) =>
          items.map((item) => (item.id === updated.id ? updated : item)),
        );
      },
      'El owner de la organización fue actualizado.',
    );
  }

  async requestPasswordReset(user: PlatformUser): Promise<void> {
    await this.action(
      `password-reset:${user.id}`,
      async () => {
        const result = await firstValueFrom(this.repository.requestPasswordReset(user.id));
        const delivery =
          result.deliveryMode === 'DEVELOPMENT'
            ? 'La solicitud quedó registrada en modo desarrollo.'
            : `Se envió el enlace a ${result.maskedEmail}.`;
        this.noticeState.set({ tone: 'SUCCESS', message: delivery });
      },
      '',
    );
  }

  async setMembershipStatus(user: PlatformUser, membershipId: string): Promise<void> {
    const membership = user.memberships.find((item) => item.id === membershipId);
    if (!membership) return;
    await this.action(
      `membership:${membershipId}`,
      async () => {
        const updated = await firstValueFrom(
          this.repository.setMembershipStatus(membershipId, !membership.isActive),
        );
        this.usersState.update((items) =>
          items.map((item) => (item.id === updated.id ? updated : item)),
        );
      },
      membership.isActive
        ? `Se deshabilitó el acceso a ${membership.organizationName}.`
        : `Se reactivó el acceso a ${membership.organizationName}.`,
    );
  }

  async setOrganizationMemberStatus(member: OrganizationMember): Promise<void> {
    const organization = this.organizationState();
    if (!organization) return;
    await this.action(
      `membership:${member.membershipId}`,
      async () => {
        await firstValueFrom(
          this.repository.setMembershipStatus(member.membershipId, !member.isActive),
        );
        this.organizationState.set(
          await firstValueFrom(this.repository.getOrganization(organization.id)),
        );
      },
      member.isActive
        ? `Se deshabilitó el acceso de ${member.name}.`
        : `Se reactivó el acceso de ${member.name}.`,
    );
  }

  async reassignMembership(request: ReassignMembershipRequest): Promise<void> {
    await this.action(
      'reassign-membership',
      async () => {
        const updated = await firstValueFrom(this.repository.reassignMembership(request));
        this.usersState.update((items) =>
          items.map((item) => (item.id === updated.id ? updated : item)),
        );
      },
      'La membresía fue reasignada a la nueva organización.',
    );
  }

  clearNotice(): void {
    this.noticeState.set(null);
  }

  private async load<T>(loader: () => Promise<T>, target: { set(value: T): void }): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set(null);
    try {
      target.set(await loader());
    } catch {
      this.errorState.set('No fue posible cargar la información. Intenta nuevamente.');
    } finally {
      this.loadingState.set(false);
    }
  }

  private async action(
    actionKey: string,
    action: () => Promise<void>,
    successMessage: string,
  ): Promise<void> {
    this.pendingActionState.set(actionKey);
    this.noticeState.set(null);
    try {
      await action();
      if (successMessage) this.noticeState.set({ tone: 'SUCCESS', message: successMessage });
    } catch (error) {
      this.noticeState.set({ tone: 'ERROR', message: this.mapActionError(error) });
    } finally {
      this.pendingActionState.set(null);
    }
  }

  private mapActionError(error: unknown): string {
    const code =
      error instanceof HttpErrorResponse
        ? ((error.error as { error?: { code?: string } } | null)?.error?.code ?? '')
        : error instanceof Error
          ? error.message
          : '';
    const messages: Record<string, string> = {
      ADMIN_OWNER_CANNOT_BE_DISABLED: 'No se puede deshabilitar al owner de la organización.',
      ADMIN_OWNER_CANNOT_BE_REASSIGNED: 'Primero debes transferir la propiedad de la organización.',
      ADMIN_MEMBERSHIP_ALREADY_EXISTS: 'El usuario ya pertenece a la organización de destino.',
      ADMIN_OWNER_MUST_BE_ACTIVE_MEMBER: 'El nuevo owner debe ser un miembro activo.',
      ADMIN_PERMISSION_SYNC_FAILED:
        'La configuración fue guardada, pero la sincronización operacional falló. Puedes reintentarla.',
      ADMIN_PERMISSION_NOT_FOUND: 'El plan contiene una capacidad que ya no existe.',
      ADMIN_PLAN_CODE_EXISTS: 'Ya existe un plan con ese código.',
      ADMIN_PLAN_IN_USE: 'No se puede archivar un plan que tiene organizaciones asignadas.',
      ADMIN_PLAN_NOT_ACTIVE: 'Solo puedes asignar un plan que esté activo.',
    };
    return messages[code] ?? 'No fue posible completar la operación.';
  }
}
