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
import {
  OperationIssue,
  OrganizationOperation,
  UpdateOperationStatusSettingsRequest,
} from '../../core/models/admin.models';
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
  readonly settingsOpen = signal(false);
  readonly inactivityRuleEnabled = signal(true);
  readonly inactivityThresholdMinutes = signal(120);
  readonly inactivitySeverity = signal<OperationIssue['severity']>('CRITICAL');
  readonly cashRegisterRuleEnabled = signal(true);
  readonly cashRegisterSeverity = signal<OperationIssue['severity']>('WARNING');

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
    void this.initialize();
  }

  async initialize(): Promise<void> {
    await this.store.loadOperationStatusSettings();
    this.hydrateSettings();
    await this.refresh();
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

  toggleSettings(): void {
    if (!this.settingsOpen()) this.hydrateSettings();
    this.settingsOpen.update((value) => !value);
  }

  toggleInactivityRule(): void {
    this.inactivityRuleEnabled.update((value) => !value);
  }

  toggleCashRegisterRule(): void {
    this.cashRegisterRuleEnabled.update((value) => !value);
  }

  setInactivityThreshold(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.inactivityThresholdMinutes.set(Number.isFinite(value) ? Math.round(value) : 120);
  }

  setInactivitySeverity(event: Event): void {
    this.inactivitySeverity.set(
      (event.target as HTMLSelectElement).value as OperationIssue['severity'],
    );
  }

  setCashRegisterSeverity(event: Event): void {
    this.cashRegisterSeverity.set(
      (event.target as HTMLSelectElement).value as OperationIssue['severity'],
    );
  }

  async saveSettings(): Promise<void> {
    const request: UpdateOperationStatusSettingsRequest = {
      inactivityRuleEnabled: this.inactivityRuleEnabled(),
      inactivityThresholdMinutes: Math.min(10080, Math.max(1, this.inactivityThresholdMinutes())),
      inactivitySeverity: this.inactivitySeverity(),
      cashRegisterRuleEnabled: this.cashRegisterRuleEnabled(),
      cashRegisterSeverity: this.cashRegisterSeverity(),
    };
    this.inactivityThresholdMinutes.set(request.inactivityThresholdMinutes);
    await this.store.saveOperationStatusSettings(request);
    this.lastUpdatedAt.set(new Date());
    this.settingsOpen.set(false);
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

  private hydrateSettings(): void {
    const settings = this.store.operationSettings();
    if (!settings) return;
    this.inactivityRuleEnabled.set(settings.inactivityRuleEnabled);
    this.inactivityThresholdMinutes.set(settings.inactivityThresholdMinutes);
    this.inactivitySeverity.set(settings.inactivitySeverity);
    this.cashRegisterRuleEnabled.set(settings.cashRegisterRuleEnabled);
    this.cashRegisterSeverity.set(settings.cashRegisterSeverity);
  }
}
