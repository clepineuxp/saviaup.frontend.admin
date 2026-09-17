import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  PlanPermissionOption,
  PlanStatus,
  PlatformPlan,
  SavePlanRequest,
} from '../../core/models/admin.models';
import { AdminStore } from '../../core/store/admin.store';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';

interface PermissionGroup {
  readonly code: string;
  readonly name: string;
  readonly permissions: readonly PlanPermissionOption[];
}

@Component({
  selector: 'app-plans',
  imports: [CurrencyPipe, ReactiveFormsModule, AppIconComponent],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlansComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly editorOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly selectedPermissions = signal<readonly string[]>([]);
  readonly form = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(40),
        Validators.pattern(/^[A-Za-z0-9_-]+$/),
      ],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(1000)],
    }),
    monthlyPrice: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    currency: new FormControl('COP', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[A-Za-z]{3}$/)],
    }),
    status: new FormControl<PlanStatus>('DRAFT', { nonNullable: true }),
  });

  readonly permissionGroups = computed<readonly PermissionGroup[]>(() => {
    const groups = new Map<string, PermissionGroup>();
    for (const permission of this.store.planPermissionCatalog()) {
      const current = groups.get(permission.moduleCode);
      groups.set(permission.moduleCode, {
        code: permission.moduleCode,
        name: permission.moduleName,
        permissions: [...(current?.permissions ?? []), permission],
      });
    }
    return [...groups.values()];
  });

  ngOnInit(): void {
    void Promise.all([this.store.loadPlans(), this.store.loadPlanPermissionCatalog()]);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.selectedPermissions.set([]);
    this.form.reset({
      code: '',
      name: '',
      description: '',
      monthlyPrice: 0,
      currency: 'COP',
      status: 'DRAFT',
    });
    this.store.clearPlanDetail();
    this.store.clearNotice();
    this.editorOpen.set(true);
  }

  async openEdit(plan: PlatformPlan): Promise<void> {
    this.store.clearNotice();
    await this.store.loadPlan(plan.id);
    const detail = this.store.planDetail();
    if (!detail) return;
    this.editingId.set(detail.id);
    this.selectedPermissions.set(detail.permissionCodes);
    this.form.reset({
      code: detail.code,
      name: detail.name,
      description: detail.description,
      monthlyPrice: detail.monthlyPrice,
      currency: detail.currency,
      status: detail.status,
    });
    this.editorOpen.set(true);
  }

  closeEditor(): void {
    if (this.store.pendingAction()?.startsWith('plan-')) return;
    this.editorOpen.set(false);
    this.store.clearPlanDetail();
  }

  togglePermission(code: string, checked: boolean): void {
    const current = new Set(this.selectedPermissions());
    if (checked) current.add(code);
    else current.delete(code);
    this.selectedPermissions.set([...current].sort());
  }

  toggleModulePermissions(group: PermissionGroup, checked: boolean): void {
    const current = new Set(this.selectedPermissions());
    for (const permission of group.permissions) {
      if (checked) current.add(permission.code);
      else current.delete(permission.code);
    }
    this.selectedPermissions.set([...current].sort());
  }

  isPermissionSelected(code: string): boolean {
    return this.selectedPermissions().includes(code);
  }

  selectedModulePermissionCount(group: PermissionGroup): number {
    const selected = new Set(this.selectedPermissions());
    return group.permissions.filter((permission) => selected.has(permission.code)).length;
  }

  isModuleSelected(group: PermissionGroup): boolean {
    return (
      group.permissions.length > 0 &&
      this.selectedModulePermissionCount(group) === group.permissions.length
    );
  }

  isModulePartiallySelected(group: PermissionGroup): boolean {
    const selectedCount = this.selectedModulePermissionCount(group);
    return selectedCount > 0 && selectedCount < group.permissions.length;
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const request: SavePlanRequest = {
      code: value.code.trim().toUpperCase(),
      name: value.name.trim(),
      description: value.description.trim(),
      monthlyPrice: value.monthlyPrice,
      currency: value.currency.trim().toUpperCase(),
      status: value.status,
      permissionCodes: this.selectedPermissions(),
    };
    await this.store.savePlan(request, this.editingId() ?? undefined);
    if (this.store.notice()?.tone === 'SUCCESS') this.closeEditor();
  }

  async toggleStatus(plan: PlatformPlan): Promise<void> {
    await this.store.setPlanStatus(plan, plan.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE');
  }

  statusLabel(status: PlanStatus): string {
    return { ACTIVE: 'Activo', DRAFT: 'Borrador', ARCHIVED: 'Archivado' }[status];
  }

  statusClass(status: PlanStatus): string {
    if (status === 'ACTIVE') return 'status';
    if (status === 'ARCHIVED') return 'status status--neutral';
    return 'status status--warning';
  }
}
