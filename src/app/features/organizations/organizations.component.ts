import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrganizationSummary } from '../../core/models/admin.models';
import { AdminStore } from '../../core/store/admin.store';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';

type OrganizationFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'ALERTS';

@Component({
  selector: 'app-organizations',
  imports: [RouterLink, CurrencyPipe, AppIconComponent],
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationsComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly search = signal('');
  readonly filter = signal<OrganizationFilter>('ALL');
  readonly confirmingStatusId = signal<string | null>(null);

  readonly filteredOrganizations = computed(() => {
    const query = this.search().trim().toLowerCase();
    const filter = this.filter();
    return this.store.organizations().filter((organization) => {
      const matchesQuery =
        !query ||
        organization.name.toLowerCase().includes(query) ||
        organization.legalName.toLowerCase().includes(query) ||
        organization.owner.email.toLowerCase().includes(query);
      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'ACTIVE' && organization.isActive) ||
        (filter === 'INACTIVE' && !organization.isActive) ||
        (filter === 'ALERTS' && ['ATTENTION', 'CRITICAL'].includes(organization.health));
      return matchesQuery && matchesFilter;
    });
  });

  ngOnInit(): void {
    void this.store.loadOrganizations();
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  onFilter(event: Event): void {
    this.filter.set((event.target as HTMLSelectElement).value as OrganizationFilter);
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  healthLabel(organization: OrganizationSummary): string {
    const labels: Record<string, string> = {
      HEALTHY: 'Estable',
      ATTENTION: 'Atención',
      CRITICAL: 'Crítico',
      INACTIVE: 'Inactiva',
    };
    return labels[organization.health] ?? organization.health;
  }

  healthClass(organization: OrganizationSummary): string {
    if (organization.health === 'CRITICAL') return 'status status--danger';
    if (organization.health === 'ATTENTION') return 'status status--warning';
    if (organization.health === 'INACTIVE') return 'status status--neutral';
    return 'status';
  }

  permissionPercentage(organization: OrganizationSummary): number {
    return organization.totalPermissionCount === 0
      ? 0
      : (organization.activePermissionCount / organization.totalPermissionCount) * 100;
  }

  async toggleStatus(organization: OrganizationSummary): Promise<void> {
    if (this.confirmingStatusId() !== organization.id) {
      this.confirmingStatusId.set(organization.id);
      return;
    }
    await this.store.setOrganizationStatus(organization);
    this.confirmingStatusId.set(null);
  }
}
