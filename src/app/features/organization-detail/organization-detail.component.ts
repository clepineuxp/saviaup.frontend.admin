import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TenantPermission } from '../../core/models/admin.models';
import { AdminStore } from '../../core/store/admin.store';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';

type OrganizationTab = 'OVERVIEW' | 'PERMISSIONS' | 'MEMBERS' | 'OPERATION';

interface PermissionGroup {
  readonly code: string;
  readonly name: string;
  readonly permissions: readonly TenantPermission[];
}

@Component({
  selector: 'app-organization-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe, DecimalPipe, AppIconComponent],
  templateUrl: './organization-detail.component.html',
  styleUrl: './organization-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(AdminStore);
  readonly tab = signal<OrganizationTab>('OVERVIEW');
  readonly selectedOwnerId = signal('');
  readonly ownerConfirmation = signal(false);

  readonly permissionGroups = computed<readonly PermissionGroup[]>(() => {
    const permissions = this.store.organization()?.permissions ?? [];
    const groups = new Map<string, PermissionGroup>();
    for (const permission of permissions) {
      const current = groups.get(permission.groupCode);
      groups.set(permission.groupCode, {
        code: permission.groupCode,
        name: permission.groupName,
        permissions: [...(current?.permissions ?? []), permission],
      });
    }
    return [...groups.values()];
  });

  readonly activeOperation = computed(() => {
    const id = this.store.organization()?.id;
    return this.store.operations().find((item) => item.organizationId === id) ?? null;
  });

  readonly ownerCandidates = computed(() =>
    (this.store.organization()?.members ?? []).filter(
      (member) => member.isActive && member.userId !== this.store.organization()?.owner.userId,
    ),
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    void Promise.all([this.store.loadOrganization(id), this.store.loadOperations()]).then(() => {
      this.selectedOwnerId.set(this.ownerCandidates()[0]?.userId ?? '');
    });
  }

  setTab(tab: OrganizationTab): void {
    this.tab.set(tab);
    this.store.clearNotice();
  }

  onOwnerChange(event: Event): void {
    this.selectedOwnerId.set((event.target as HTMLSelectElement).value);
    this.ownerConfirmation.set(false);
  }

  async changeOwner(): Promise<void> {
    if (!this.selectedOwnerId()) return;
    if (!this.ownerConfirmation()) {
      this.ownerConfirmation.set(true);
      return;
    }
    await this.store.changeOwner(this.selectedOwnerId());
    this.selectedOwnerId.set(this.ownerCandidates()[0]?.userId ?? '');
    this.ownerConfirmation.set(false);
  }

  enabledCount(group: PermissionGroup): number {
    return group.permissions.filter(({ enabled }) => enabled).length;
  }

  healthLabel(health: string): string {
    const labels: Record<string, string> = {
      HEALTHY: 'Operación estable',
      ATTENTION: 'Requiere atención',
      CRITICAL: 'Estado crítico',
      INACTIVE: 'Organización inactiva',
    };
    return labels[health] ?? health;
  }

  healthClass(health: string): string {
    if (health === 'CRITICAL') return 'status status--danger';
    if (health === 'ATTENTION') return 'status status--warning';
    if (health === 'INACTIVE') return 'status status--neutral';
    return 'status';
  }
}
