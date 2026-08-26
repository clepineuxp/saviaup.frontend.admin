import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AdminStore } from '../../core/store/admin.store';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';

@Component({
  selector: 'app-plans',
  imports: [CurrencyPipe, AppIconComponent],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlansComponent implements OnInit {
  readonly store = inject(AdminStore);

  ngOnInit(): void {
    void this.store.loadPlans();
  }
}
