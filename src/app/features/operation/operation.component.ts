import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrganizationOperation } from '../../core/models/admin.models';
import { AdminStore } from '../../core/store/admin.store';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';

type OperationFilter = 'ALL' | 'HEALTHY' | 'ALERTS' | 'INACTIVE';

@Component({
  selector: 'app-operation',
  imports: [RouterLink, CurrencyPipe, DatePipe, DecimalPipe, AppIconComponent],
  templateUrl: './operation.component.html',
  styleUrl: './operation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly search = signal('');
  readonly filter = signal<OperationFilter>('ALL');
  readonly lastUpdatedAt = signal(new Date());

  readonly filteredOperations = computed(() => {
    const query = this.search().trim().toLowerCase();
    const filter = this.filter();
    return this.store.operations().filter((item) => {
      const matchesQuery = !query || item.organizationName.toLowerCase().includes(query);
      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'HEALTHY' && item.health === 'HEALTHY') ||
        (filter === 'ALERTS' && ['ATTENTION', 'CRITICAL'].includes(item.health)) ||
        (filter === 'INACTIVE' && item.health === 'INACTIVE');
      return matchesQuery && matchesFilter;
    });
  });

  readonly totals = computed(() => {
    const active = this.store.operations().filter((item) => item.health !== 'INACTIVE');
    return {
      sales: active.reduce((sum, item) => sum + item.todaySales, 0),
      orders: active.reduce((sum, item) => sum + item.todayOrders, 0),
      alerts: active.reduce((sum, item) => sum + item.issues.length, 0),
      online: active.filter((item) => item.apiStatus === 'ONLINE').length,
    };
  });

  ngOnInit(): void {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    await this.store.loadOperations();
    this.lastUpdatedAt.set(new Date());
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  setFilter(filter: OperationFilter): void {
    this.filter.set(filter);
  }

  healthLabel(item: OrganizationOperation): string {
    const labels: Record<string, string> = {
      HEALTHY: 'Estable',
      ATTENTION: 'Atención',
      CRITICAL: 'Crítico',
      INACTIVE: 'Inactiva',
    };
    return labels[item.health] ?? item.health;
  }

  healthClass(item: OrganizationOperation): string {
    if (item.health === 'CRITICAL') return 'status status--danger';
    if (item.health === 'ATTENTION') return 'status status--warning';
    if (item.health === 'INACTIVE') return 'status status--neutral';
    return 'status';
  }

  tableOccupancy(item: OrganizationOperation): number {
    return item.totalTables ? Math.round((item.occupiedTables / item.totalTables) * 100) : 0;
  }
}
