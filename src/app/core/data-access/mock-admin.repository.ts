import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import {
  AuditEvent,
  DashboardSnapshot,
  OrganizationDetail,
  OrganizationMember,
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
  TenantPermission,
} from '../models/admin.models';
import { AdminRepository } from './admin.repository';

const RESPONSE_DELAY = 220;

const PERMISSIONS: readonly Omit<TenantPermission, 'enabled'>[] = [
  {
    code: 'tables.read',
    name: 'Consultar mesas',
    description: 'Permite visualizar salas, mesas y su estado operativo.',
    groupCode: 'sales',
    groupName: 'Ventas',
  },
  {
    code: 'tables.operate',
    name: 'Operar mesas',
    description: 'Permite abrir, actualizar y liberar mesas.',
    groupCode: 'sales',
    groupName: 'Ventas',
  },
  {
    code: 'tables.manage',
    name: 'Configurar mesas',
    description: 'Permite administrar salas, mesas y distribución.',
    groupCode: 'sales',
    groupName: 'Ventas',
  },
  {
    code: 'orders.read',
    name: 'Consultar órdenes',
    description: 'Acceso al historial y detalle de órdenes.',
    groupCode: 'operation',
    groupName: 'Operación',
  },
  {
    code: 'orders.manage',
    name: 'Gestionar órdenes',
    description: 'Permite crear, mover, cancelar y cobrar órdenes.',
    groupCode: 'operation',
    groupName: 'Operación',
  },
  {
    code: 'reports.read',
    name: 'Consultar reportes',
    description: 'Acceso a indicadores y reportes de la organización.',
    groupCode: 'operation',
    groupName: 'Operación',
  },
  {
    code: 'billing.read',
    name: 'Consultar facturación',
    description: 'Acceso a comprobantes y documentos emitidos.',
    groupCode: 'operation',
    groupName: 'Operación',
  },
  {
    code: 'products.read',
    name: 'Consultar productos',
    description: 'Acceso al catálogo de productos y combos.',
    groupCode: 'catalog',
    groupName: 'Catálogo e inventario',
  },
  {
    code: 'products.manage',
    name: 'Gestionar productos',
    description: 'Permite crear, editar y desactivar productos.',
    groupCode: 'catalog',
    groupName: 'Catálogo e inventario',
  },
  {
    code: 'categories.read',
    name: 'Consultar categorías',
    description: 'Acceso a categorías de productos e ingredientes.',
    groupCode: 'catalog',
    groupName: 'Catálogo e inventario',
  },
  {
    code: 'categories.manage',
    name: 'Gestionar categorías',
    description: 'Permite crear, editar y desactivar categorías.',
    groupCode: 'catalog',
    groupName: 'Catálogo e inventario',
  },
  {
    code: 'inventory.stock.read',
    name: 'Consultar existencias',
    description: 'Acceso a niveles actuales y mínimos de inventario.',
    groupCode: 'inventory',
    groupName: 'Inventario',
  },
  {
    code: 'inventory.ingredients.read',
    name: 'Consultar ingredientes',
    description: 'Acceso al catálogo de ingredientes.',
    groupCode: 'inventory',
    groupName: 'Inventario',
  },
  {
    code: 'inventory.ingredients.manage',
    name: 'Gestionar ingredientes',
    description: 'Permite crear, editar y desactivar ingredientes.',
    groupCode: 'inventory',
    groupName: 'Inventario',
  },
  {
    code: 'inventory.movements.read',
    name: 'Consultar movimientos',
    description: 'Acceso al historial de entradas y salidas.',
    groupCode: 'inventory',
    groupName: 'Inventario',
  },
  {
    code: 'inventory.movements.manage',
    name: 'Registrar movimientos',
    description: 'Permite registrar entradas y salidas de inventario.',
    groupCode: 'inventory',
    groupName: 'Inventario',
  },
  {
    code: 'inventory.complements.read',
    name: 'Consultar complementos',
    description: 'Acceso a unidades de medida y complementos.',
    groupCode: 'inventory',
    groupName: 'Inventario',
  },
  {
    code: 'inventory.complements.manage',
    name: 'Gestionar complementos',
    description: 'Permite administrar unidades y complementos.',
    groupCode: 'inventory',
    groupName: 'Inventario',
  },
  {
    code: 'settings.organization.manage',
    name: 'Gestionar organización',
    description: 'Permite modificar la información legal y comercial.',
    groupCode: 'settings',
    groupName: 'Configuración',
  },
  {
    code: 'settings.business.manage',
    name: 'Gestionar negocio',
    description: 'Permite modificar parámetros operativos.',
    groupCode: 'settings',
    groupName: 'Configuración',
  },
  {
    code: 'settings.payment-methods.manage',
    name: 'Gestionar medios de pago',
    description: 'Permite administrar formas de pago y caja.',
    groupCode: 'settings',
    groupName: 'Configuración',
  },
  {
    code: 'settings.users.manage',
    name: 'Gestionar usuarios',
    description: 'Permite invitar, habilitar y deshabilitar miembros.',
    groupCode: 'settings',
    groupName: 'Configuración',
  },
  {
    code: 'settings.roles.manage',
    name: 'Gestionar roles',
    description: 'Permite crear roles y asignar permisos.',
    groupCode: 'settings',
    groupName: 'Configuración',
  },
];

let PLANS: PlatformPlan[] = [
  {
    id: 'plan-starter',
    code: 'ESSENTIAL',
    name: 'Esencial',
    description: 'Operación principal para restaurantes que están comenzando.',
    monthlyPrice: 89000,
    currency: 'COP',
    status: 'DRAFT',
    organizationCount: 2,
    includedPermissionCount: 11,
  },
  {
    id: 'plan-growth',
    code: 'GROWTH',
    name: 'Crecimiento',
    description: 'Inventario, reportes y gestión avanzada para equipos en expansión.',
    monthlyPrice: 169000,
    currency: 'COP',
    status: 'DRAFT',
    organizationCount: 2,
    includedPermissionCount: 19,
  },
  {
    id: 'plan-pro',
    code: 'PROFESSIONAL',
    name: 'Profesional',
    description: 'Todas las capacidades de SaviaUp y acompañamiento prioritario.',
    monthlyPrice: 269000,
    currency: 'COP',
    status: 'DRAFT',
    organizationCount: 1,
    includedPermissionCount: 23,
  },
];

const PLAN_SUMMARIES = new Map(
  PLANS.map((plan) => [
    plan.id,
    {
      id: plan.id,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      currency: plan.currency,
    },
  ]),
);

const BASE_ORGANIZATIONS: OrganizationSummary[] = [
  {
    id: 'org-secret-garden',
    name: 'Secret Garden',
    legalName: 'Secret Garden Gastrobar S.A.S.',
    slug: 'secret-garden',
    isActive: true,
    owner: { userId: 'usr-1', name: 'Valentina Ríos', email: 'valentina@secretgarden.co' },
    memberCount: 0,
    activePermissionCount: 0,
    totalPermissionCount: PERMISSIONS.length,
    plan: PLAN_SUMMARIES.get('plan-growth') ?? null,
    createdAt: '2026-01-18T14:12:00Z',
    lastActivityAt: '2026-08-25T15:42:00Z',
    health: 'HEALTHY',
  },
  {
    id: 'org-savia-demo',
    name: 'Savia Demo',
    legalName: 'Savia Demo S.A.S.',
    slug: 'savia-demo',
    isActive: true,
    owner: { userId: 'usr-2', name: 'Mateo Salazar', email: 'mateo@saviademo.co' },
    memberCount: 0,
    activePermissionCount: 0,
    totalPermissionCount: PERMISSIONS.length,
    plan: PLAN_SUMMARIES.get('plan-starter') ?? null,
    createdAt: '2026-02-03T09:35:00Z',
    lastActivityAt: '2026-08-25T14:18:00Z',
    health: 'ATTENTION',
  },
  {
    id: 'org-brasa-origen',
    name: 'Brasa & Origen',
    legalName: 'Brasa y Origen Cocina S.A.S.',
    slug: 'brasa-origen',
    isActive: true,
    owner: { userId: 'usr-3', name: 'Laura Bernal', email: 'laura@brasayorigen.co' },
    memberCount: 0,
    activePermissionCount: 0,
    totalPermissionCount: PERMISSIONS.length,
    plan: PLAN_SUMMARIES.get('plan-pro') ?? null,
    createdAt: '2026-03-11T17:20:00Z',
    lastActivityAt: '2026-08-25T15:49:00Z',
    health: 'HEALTHY',
  },
  {
    id: 'org-casa-nomada',
    name: 'Casa Nómada',
    legalName: 'Casa Nómada Experiencias S.A.S.',
    slug: 'casa-nomada',
    isActive: false,
    owner: { userId: 'usr-4', name: 'Andrés Solano', email: 'andres@casanomada.co' },
    memberCount: 0,
    activePermissionCount: 0,
    totalPermissionCount: PERMISSIONS.length,
    plan: PLAN_SUMMARIES.get('plan-starter') ?? null,
    createdAt: '2026-04-05T12:06:00Z',
    lastActivityAt: '2026-08-09T22:11:00Z',
    health: 'INACTIVE',
  },
  {
    id: 'org-taller-sabor',
    name: 'Taller del Sabor',
    legalName: 'Taller del Sabor S.A.S.',
    slug: 'taller-del-sabor',
    isActive: true,
    owner: { userId: 'usr-6', name: 'Daniela Peña', email: 'daniela@tallerdelsabor.co' },
    memberCount: 0,
    activePermissionCount: 0,
    totalPermissionCount: PERMISSIONS.length,
    plan: PLAN_SUMMARIES.get('plan-growth') ?? null,
    createdAt: '2026-05-22T08:50:00Z',
    lastActivityAt: '2026-08-25T13:06:00Z',
    health: 'CRITICAL',
  },
];

let USERS: PlatformUser[] = [
  {
    id: 'usr-1',
    firstName: 'Valentina',
    lastName: 'Ríos',
    email: 'valentina@secretgarden.co',
    isActive: true,
    createdAt: '2026-01-18T14:08:00Z',
    lastAccessAt: '2026-08-25T15:39:00Z',
    memberships: [
      {
        id: 'mem-1',
        organizationId: 'org-secret-garden',
        organizationName: 'Secret Garden',
        roleCode: 'TENANT_OWNER',
        roleName: 'Propietaria',
        isActive: true,
        disabledUntil: null,
      },
    ],
  },
  {
    id: 'usr-2',
    firstName: 'Mateo',
    lastName: 'Salazar',
    email: 'mateo@saviademo.co',
    isActive: true,
    createdAt: '2026-02-03T09:31:00Z',
    lastAccessAt: '2026-08-25T14:18:00Z',
    memberships: [
      {
        id: 'mem-2',
        organizationId: 'org-savia-demo',
        organizationName: 'Savia Demo',
        roleCode: 'TENANT_OWNER',
        roleName: 'Propietario',
        isActive: true,
        disabledUntil: null,
      },
    ],
  },
  {
    id: 'usr-3',
    firstName: 'Laura',
    lastName: 'Bernal',
    email: 'laura@brasayorigen.co',
    isActive: true,
    createdAt: '2026-03-11T17:12:00Z',
    lastAccessAt: '2026-08-25T15:47:00Z',
    memberships: [
      {
        id: 'mem-3',
        organizationId: 'org-brasa-origen',
        organizationName: 'Brasa & Origen',
        roleCode: 'TENANT_OWNER',
        roleName: 'Propietaria',
        isActive: true,
        disabledUntil: null,
      },
    ],
  },
  {
    id: 'usr-4',
    firstName: 'Andrés',
    lastName: 'Solano',
    email: 'andres@casanomada.co',
    isActive: true,
    createdAt: '2026-04-05T12:01:00Z',
    lastAccessAt: '2026-08-09T22:11:00Z',
    memberships: [
      {
        id: 'mem-4',
        organizationId: 'org-casa-nomada',
        organizationName: 'Casa Nómada',
        roleCode: 'TENANT_OWNER',
        roleName: 'Propietario',
        isActive: true,
        disabledUntil: null,
      },
    ],
  },
  {
    id: 'usr-5',
    firstName: 'Camila',
    lastName: 'Mejía',
    email: 'camila@secretgarden.co',
    isActive: true,
    createdAt: '2026-02-10T10:44:00Z',
    lastAccessAt: '2026-08-24T19:22:00Z',
    memberships: [
      {
        id: 'mem-5',
        organizationId: 'org-secret-garden',
        organizationName: 'Secret Garden',
        roleCode: 'MANAGER',
        roleName: 'Administradora',
        isActive: true,
        disabledUntil: null,
      },
      {
        id: 'mem-6',
        organizationId: 'org-savia-demo',
        organizationName: 'Savia Demo',
        roleCode: 'AUDITOR',
        roleName: 'Auditora',
        isActive: false,
        disabledUntil: null,
      },
    ],
  },
  {
    id: 'usr-6',
    firstName: 'Daniela',
    lastName: 'Peña',
    email: 'daniela@tallerdelsabor.co',
    isActive: true,
    createdAt: '2026-05-22T08:43:00Z',
    lastAccessAt: '2026-08-25T13:06:00Z',
    memberships: [
      {
        id: 'mem-7',
        organizationId: 'org-taller-sabor',
        organizationName: 'Taller del Sabor',
        roleCode: 'TENANT_OWNER',
        roleName: 'Propietaria',
        isActive: true,
        disabledUntil: null,
      },
    ],
  },
  {
    id: 'usr-7',
    firstName: 'Julián',
    lastName: 'Torres',
    email: 'julian@brasayorigen.co',
    isActive: true,
    createdAt: '2026-04-14T11:19:00Z',
    lastAccessAt: '2026-08-25T12:32:00Z',
    memberships: [
      {
        id: 'mem-8',
        organizationId: 'org-brasa-origen',
        organizationName: 'Brasa & Origen',
        roleCode: 'CASHIER',
        roleName: 'Cajero',
        isActive: true,
        disabledUntil: null,
      },
    ],
  },
  {
    id: 'usr-8',
    firstName: 'Sofía',
    lastName: 'Cárdenas',
    email: 'sofia@tallerdelsabor.co',
    isActive: false,
    createdAt: '2026-06-02T16:25:00Z',
    lastAccessAt: '2026-08-16T21:09:00Z',
    memberships: [
      {
        id: 'mem-9',
        organizationId: 'org-taller-sabor',
        organizationName: 'Taller del Sabor',
        roleCode: 'WAITER',
        roleName: 'Mesera',
        isActive: false,
        disabledUntil: null,
      },
    ],
  },
];

let ORGANIZATIONS = [...BASE_ORGANIZATIONS];

const PERMISSIONS_BY_ORGANIZATION = new Map<string, Set<string>>([
  ['org-secret-garden', new Set(PERMISSIONS.slice(0, 19).map(({ code }) => code))],
  ['org-savia-demo', new Set(PERMISSIONS.slice(0, 11).map(({ code }) => code))],
  ['org-brasa-origen', new Set(PERMISSIONS.map(({ code }) => code))],
  ['org-casa-nomada', new Set(PERMISSIONS.slice(0, 11).map(({ code }) => code))],
  ['org-taller-sabor', new Set(PERMISSIONS.slice(0, 19).map(({ code }) => code))],
]);

const OPERATIONS: OrganizationOperation[] = [
  {
    organizationId: 'org-secret-garden',
    organizationName: 'Secret Garden',
    health: 'HEALTHY',
    apiStatus: 'ONLINE',
    todaySales: 4865000,
    todayOrders: 138,
    averageTicket: 35254,
    occupiedTables: 11,
    totalTables: 18,
    openCashRegisters: 2,
    cashRegisterStatus: 'OPEN',
    lastOrderAt: '2026-08-25T15:42:00Z',
    issues: [],
  },
  {
    organizationId: 'org-savia-demo',
    organizationName: 'Savia Demo',
    health: 'ATTENTION',
    apiStatus: 'ONLINE',
    todaySales: 1260000,
    todayOrders: 42,
    averageTicket: 30000,
    occupiedTables: 2,
    totalTables: 8,
    openCashRegisters: 0,
    cashRegisterStatus: 'CLOSED',
    lastOrderAt: '2026-08-25T14:18:00Z',
    issues: [{ severity: 'WARNING', message: 'Caja cerrada durante horario operativo.' }],
  },
  {
    organizationId: 'org-brasa-origen',
    organizationName: 'Brasa & Origen',
    health: 'HEALTHY',
    apiStatus: 'ONLINE',
    todaySales: 7318000,
    todayOrders: 184,
    averageTicket: 39772,
    occupiedTables: 16,
    totalTables: 24,
    openCashRegisters: 3,
    cashRegisterStatus: 'OPEN',
    lastOrderAt: '2026-08-25T15:49:00Z',
    issues: [],
  },
  {
    organizationId: 'org-casa-nomada',
    organizationName: 'Casa Nómada',
    health: 'INACTIVE',
    apiStatus: 'OFFLINE',
    todaySales: 0,
    todayOrders: 0,
    averageTicket: 0,
    occupiedTables: 0,
    totalTables: 12,
    openCashRegisters: 0,
    cashRegisterStatus: 'CLOSED',
    lastOrderAt: '2026-08-09T22:11:00Z',
    issues: [],
  },
  {
    organizationId: 'org-taller-sabor',
    organizationName: 'Taller del Sabor',
    health: 'CRITICAL',
    apiStatus: 'DEGRADED',
    todaySales: 980000,
    todayOrders: 31,
    averageTicket: 31613,
    occupiedTables: 6,
    totalTables: 10,
    openCashRegisters: 1,
    cashRegisterStatus: 'OPEN',
    lastOrderAt: '2026-08-25T13:06:00Z',
    issues: [
      { severity: 'CRITICAL', message: 'Sin actividad de órdenes en las últimas 2 horas.' },
      { severity: 'WARNING', message: 'Tres productos con configuración incompleta.' },
    ],
  },
];

const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'evt-1',
    action: 'Permiso actualizado',
    subject: 'Secret Garden',
    detail: 'Se habilitó billing.read para la organización.',
    occurredAt: '2026-08-25T15:31:00Z',
    kind: 'ORGANIZATION',
  },
  {
    id: 'evt-2',
    action: 'Acceso reactivado',
    subject: 'Camila Mejía',
    detail: 'Membresía reactivada en Secret Garden.',
    occurredAt: '2026-08-25T14:54:00Z',
    kind: 'USER',
  },
  {
    id: 'evt-3',
    action: 'Alerta operativa',
    subject: 'Taller del Sabor',
    detail: 'La API reportó latencia elevada.',
    occurredAt: '2026-08-25T13:12:00Z',
    kind: 'OPERATION',
  },
  {
    id: 'evt-4',
    action: 'Owner actualizado',
    subject: 'Brasa & Origen',
    detail: 'La propiedad de la organización fue transferida.',
    occurredAt: '2026-08-24T19:40:00Z',
    kind: 'SECURITY',
  },
];

@Injectable()
export class MockAdminRepository implements AdminRepository {
  getDashboard(): Observable<DashboardSnapshot> {
    const organizations = this.organizationSummaries();
    const activeOperations = OPERATIONS.filter(({ health }) => health !== 'INACTIVE');
    return this.respond({
      totalUsers: USERS.length,
      activeUsers: USERS.filter(({ isActive }) => isActive).length,
      totalOrganizations: organizations.length,
      activeOrganizations: organizations.filter(({ isActive }) => isActive).length,
      organizationsWithAlerts: activeOperations.filter(({ issues }) => issues.length > 0).length,
      todayGrossVolume: activeOperations.reduce((total, item) => total + item.todaySales, 0),
      todayOrders: activeOperations.reduce((total, item) => total + item.todayOrders, 0),
      monthlyRecurringRevenue: organizations.reduce(
        (total, item) => total + (item.isActive ? (item.plan?.monthlyPrice ?? 0) : 0),
        0,
      ),
      organizationGrowth: 12.8,
      recentEvents: AUDIT_EVENTS,
      organizationHealth: OPERATIONS,
    });
  }

  getUsers(): Observable<readonly PlatformUser[]> {
    return this.respond(USERS);
  }

  getOrganizations(): Observable<readonly OrganizationSummary[]> {
    return this.respond(this.organizationSummaries());
  }

  getOrganization(id: string): Observable<OrganizationDetail> {
    const organization = this.organizationSummaries().find((item) => item.id === id);
    if (!organization) return this.fail('ADMIN_ORGANIZATION_NOT_FOUND');
    return this.respond(this.buildOrganizationDetail(organization));
  }

  getOperations(): Observable<readonly OrganizationOperation[]> {
    return this.respond(OPERATIONS);
  }

  getPlans(): Observable<readonly PlatformPlan[]> {
    return this.respond(PLANS);
  }

  getPlan(id: string): Observable<PlanDetail> {
    const plan = PLANS.find((item) => item.id === id);
    if (!plan) return this.fail('ADMIN_PLAN_NOT_FOUND');
    return this.respond(this.planDetail(plan));
  }

  getPlanPermissionCatalog(): Observable<readonly PlanPermissionOption[]> {
    return this.respond(
      PERMISSIONS.map((item) => ({
        code: item.code,
        description: item.description,
        moduleCode: item.groupCode,
        moduleName: item.groupName,
      })),
    );
  }

  createPlan(request: SavePlanRequest): Observable<PlanDetail> {
    const plan: PlatformPlan = {
      id: `plan-${Date.now()}`,
      code: request.code,
      name: request.name,
      description: request.description,
      monthlyPrice: request.monthlyPrice,
      currency: request.currency,
      status: request.status,
      organizationCount: 0,
      includedPermissionCount: request.permissionCodes.length,
    };
    PLANS = [...PLANS, plan];
    return this.respond(this.planDetail(plan, request.permissionCodes));
  }

  updatePlan(id: string, request: SavePlanRequest): Observable<PlanDetail> {
    const existing = PLANS.find((item) => item.id === id);
    if (!existing) return this.fail('ADMIN_PLAN_NOT_FOUND');
    const updated: PlatformPlan = {
      ...existing,
      code: request.code,
      name: request.name,
      description: request.description,
      monthlyPrice: request.monthlyPrice,
      currency: request.currency,
      status: request.status,
      includedPermissionCount: request.permissionCodes.length,
    };
    PLANS = PLANS.map((item) => (item.id === id ? updated : item));
    return this.respond(this.planDetail(updated, request.permissionCodes));
  }

  setPlanStatus(id: string, status: PlatformPlan['status']): Observable<PlanDetail> {
    const existing = PLANS.find((item) => item.id === id);
    if (!existing) return this.fail('ADMIN_PLAN_NOT_FOUND');
    const updated = { ...existing, status };
    PLANS = PLANS.map((item) => (item.id === id ? updated : item));
    return this.respond(this.planDetail(updated));
  }

  assignPlan(
    organizationId: string,
    planId: string,
    preserveOverrides = false,
  ): Observable<PlanAssignmentResult> {
    const plan = PLANS.find((item) => item.id === planId);
    const organization = ORGANIZATIONS.find((item) => item.id === organizationId);
    if (!plan || !organization) return this.fail('ADMIN_PLAN_ASSIGNMENT_INVALID');
    ORGANIZATIONS = ORGANIZATIONS.map((item) =>
      item.id === organizationId
        ? {
            ...item,
            plan: {
              id: plan.id,
              name: plan.name,
              monthlyPrice: plan.monthlyPrice,
              currency: plan.currency,
            },
          }
        : item,
    );
    if (!preserveOverrides) {
      PERMISSIONS_BY_ORGANIZATION.set(
        organizationId,
        new Set(PERMISSIONS.slice(0, plan.includedPermissionCount).map((item) => item.code)),
      );
    }
    return this.respond({
      organizationId,
      planId,
      syncStatus: 'SYNCED',
      lastSyncedAt: new Date().toISOString(),
    });
  }

  setOrganizationStatus(id: string, isActive: boolean): Observable<OrganizationSummary> {
    const existing = ORGANIZATIONS.find((item) => item.id === id);
    if (!existing) return this.fail('ADMIN_ORGANIZATION_NOT_FOUND');

    ORGANIZATIONS = ORGANIZATIONS.map((item) =>
      item.id === id ? { ...item, isActive, health: isActive ? 'ATTENTION' : 'INACTIVE' } : item,
    );
    const updated = this.organizationSummaries().find((item) => item.id === id);
    return updated ? this.respond(updated) : this.fail('ADMIN_ORGANIZATION_NOT_FOUND');
  }

  setTenantPermission(
    organizationId: string,
    permissionCode: string,
    enabled: boolean,
  ): Observable<OrganizationDetail> {
    const organization = this.organizationSummaries().find((item) => item.id === organizationId);
    const permission = PERMISSIONS.find((item) => item.code === permissionCode);
    const enabledCodes = PERMISSIONS_BY_ORGANIZATION.get(organizationId);
    if (!organization || !permission || !enabledCodes)
      return this.fail('ADMIN_PERMISSION_NOT_FOUND');

    if (enabled) enabledCodes.add(permissionCode);
    else enabledCodes.delete(permissionCode);

    return this.respond(this.buildOrganizationDetail(organization));
  }

  changeOwner(organizationId: string, userId: string): Observable<OrganizationDetail> {
    const user = USERS.find((item) => item.id === userId);
    const organization = ORGANIZATIONS.find((item) => item.id === organizationId);
    const membership = user?.memberships.find(
      (item) => item.organizationId === organizationId && item.isActive,
    );
    if (!user || !organization || !membership)
      return this.fail('ADMIN_OWNER_MUST_BE_ACTIVE_MEMBER');

    const previousOwnerId = organization.owner.userId;
    USERS = USERS.map((item) => ({
      ...item,
      memberships: item.memberships.map((entry) => {
        if (entry.organizationId !== organizationId) return entry;
        if (item.id === previousOwnerId) {
          return { ...entry, roleCode: 'MANAGER', roleName: 'Administrador/a' };
        }
        if (item.id === userId) {
          return { ...entry, roleCode: 'TENANT_OWNER', roleName: 'Propietario/a' };
        }
        return entry;
      }),
    }));
    ORGANIZATIONS = ORGANIZATIONS.map((item) =>
      item.id === organizationId
        ? {
            ...item,
            owner: {
              userId: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
            },
          }
        : item,
    );

    const updated = this.organizationSummaries().find((item) => item.id === organizationId);
    return updated
      ? this.respond(this.buildOrganizationDetail(updated))
      : this.fail('ADMIN_ORGANIZATION_NOT_FOUND');
  }

  requestPasswordReset(userId: string): Observable<PasswordResetResult> {
    const user = USERS.find((item) => item.id === userId);
    if (!user) return this.fail('ADMIN_USER_NOT_FOUND');
    const [localPart = '', domain = ''] = user.email.split('@');
    const maskedLocal = `${localPart.slice(0, 2)}${'*'.repeat(Math.max(2, localPart.length - 2))}`;
    return this.respond({
      maskedEmail: `${maskedLocal}@${domain}`,
      deliveryMode: 'DEVELOPMENT',
    });
  }

  setMembershipStatus(membershipId: string, isActive: boolean): Observable<PlatformUser> {
    const user = USERS.find((item) => item.memberships.some(({ id }) => id === membershipId));
    const membership = user?.memberships.find(({ id }) => id === membershipId);
    if (!user || !membership) return this.fail('ADMIN_MEMBERSHIP_NOT_FOUND');
    if (!isActive && membership.roleCode === 'TENANT_OWNER') {
      return this.fail('ADMIN_OWNER_CANNOT_BE_DISABLED');
    }

    USERS = USERS.map((item) =>
      item.id === user.id
        ? {
            ...item,
            isActive:
              isActive ||
              item.memberships.some((entry) => entry.id !== membershipId && entry.isActive),
            memberships: item.memberships.map((entry) =>
              entry.id === membershipId ? { ...entry, isActive, disabledUntil: null } : entry,
            ),
          }
        : item,
    );
    const updated = USERS.find((item) => item.id === user.id);
    return updated ? this.respond(updated) : this.fail('ADMIN_USER_NOT_FOUND');
  }

  reassignMembership(request: ReassignMembershipRequest): Observable<PlatformUser> {
    const user = USERS.find((item) => item.id === request.userId);
    const membership = user?.memberships.find((item) => item.id === request.membershipId);
    const target = ORGANIZATIONS.find((item) => item.id === request.targetOrganizationId);
    if (!user || !membership || !target) return this.fail('ADMIN_REASSIGNMENT_INVALID');
    if (membership.roleCode === 'TENANT_OWNER')
      return this.fail('ADMIN_OWNER_CANNOT_BE_REASSIGNED');
    if (user.memberships.some((item) => item.organizationId === target.id)) {
      return this.fail('ADMIN_MEMBERSHIP_ALREADY_EXISTS');
    }

    USERS = USERS.map((item) =>
      item.id === user.id
        ? {
            ...item,
            memberships: item.memberships.map((entry) =>
              entry.id === membership.id
                ? {
                    ...entry,
                    organizationId: target.id,
                    organizationName: target.name,
                    roleCode: 'MANAGER',
                    roleName: 'Administrador/a',
                    isActive: true,
                    disabledUntil: null,
                  }
                : entry,
            ),
          }
        : item,
    );
    const updated = USERS.find((item) => item.id === user.id);
    return updated ? this.respond(updated) : this.fail('ADMIN_USER_NOT_FOUND');
  }

  private organizationSummaries(): OrganizationSummary[] {
    return ORGANIZATIONS.map((organization) => ({
      ...organization,
      memberCount: USERS.reduce(
        (count, user) =>
          count + user.memberships.filter((item) => item.organizationId === organization.id).length,
        0,
      ),
      activePermissionCount: PERMISSIONS_BY_ORGANIZATION.get(organization.id)?.size ?? 0,
    }));
  }

  private buildOrganizationDetail(organization: OrganizationSummary): OrganizationDetail {
    const enabledCodes = PERMISSIONS_BY_ORGANIZATION.get(organization.id) ?? new Set<string>();
    const members: OrganizationMember[] = USERS.flatMap((user) =>
      user.memberships
        .filter((membership) => membership.organizationId === organization.id)
        .map((membership) => ({
          membershipId: membership.id,
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          roleCode: membership.roleCode,
          roleName: membership.roleName,
          isActive: membership.isActive,
          disabledUntil: membership.disabledUntil,
          lastAccessAt: user.lastAccessAt,
        })),
    );
    return {
      ...organization,
      documentNumber: organization.id === 'org-secret-garden' ? '901.458.632-1' : '901.000.000-0',
      contactEmail: organization.owner.email,
      city: organization.id === 'org-brasa-origen' ? 'Medellín' : 'Bogotá D.C.',
      permissions: PERMISSIONS.map((permission) => ({
        ...permission,
        enabled: enabledCodes.has(permission.code),
      })),
      members,
      permissionSyncStatus: 'SYNCED',
      lastPermissionsSyncAt: new Date().toISOString(),
    };
  }

  private planDetail(
    plan: PlatformPlan,
    permissionCodes: readonly string[] = PERMISSIONS.slice(0, plan.includedPermissionCount).map(
      (item) => item.code,
    ),
  ): PlanDetail {
    return {
      ...plan,
      permissionCodes,
      priceHistory: [
        {
          id: `price-${plan.id}`,
          monthlyPrice: plan.monthlyPrice,
          currency: plan.currency,
          effectiveFrom: '2026-01-01T00:00:00Z',
          effectiveUntil: null,
        },
      ],
    };
  }

  private respond<T>(value: T): Observable<T> {
    return of(structuredClone(value)).pipe(delay(RESPONSE_DELAY));
  }

  private fail<T>(code: string): Observable<T> {
    return throwError(() => new Error(code));
  }
}
