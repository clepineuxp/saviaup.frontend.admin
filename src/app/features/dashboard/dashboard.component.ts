import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminStore } from '../../core/store/admin.store';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CurrencyPipe, DatePipe, DecimalPipe, AppIconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  readonly store = inject(AdminStore);

  ngOnInit(): void {
    void this.store.loadDashboard();
  }

  healthLabel(health: string): string {
    const labels: Record<string, string> = {
      HEALTHY: 'Estable',
      ATTENTION: 'Atención',
      CRITICAL: 'Crítico',
      INACTIVE: 'Inactiva',
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
