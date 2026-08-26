import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthStore } from '../../core/auth/admin-auth.store';
import { AppIconComponent, AppIconName } from '../../shared/components/app-icon/app-icon.component';

interface NavigationItem {
  readonly label: string;
  readonly route: string;
  readonly icon: AppIconName;
  readonly exact?: boolean;
  readonly badge?: string;
}

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppIconComponent],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellComponent {
  private readonly router = inject(Router);
  readonly auth = inject(AdminAuthStore);
  readonly mobileMenuOpen = signal(false);
  readonly navigation: readonly NavigationItem[] = [
    { label: 'Resumen', route: '/dashboard', icon: 'dashboard', exact: true },
    { label: 'Usuarios', route: '/users', icon: 'users' },
    { label: 'Organizaciones', route: '/organizations', icon: 'building' },
    { label: 'Operación', route: '/operation', icon: 'activity', badge: '2' },
    { label: 'Planes y precios', route: '/plans', icon: 'plans' },
  ];

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  async logout(): Promise<void> {
    this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
