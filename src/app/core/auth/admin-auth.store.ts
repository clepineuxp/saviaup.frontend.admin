import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminSession } from '../models/admin.models';
import { ADMIN_AUTH_REPOSITORY } from './admin-auth.repository';
import { ADMIN_SESSION_KEY, readAdminSession } from './admin-session.storage';

@Injectable({ providedIn: 'root' })
export class AdminAuthStore {
  private readonly repository = inject(ADMIN_AUTH_REPOSITORY);
  private readonly sessionState = signal<AdminSession | null>(readAdminSession());
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly session = this.sessionState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly isAuthenticated = computed(() => {
    const session = this.sessionState();
    return session !== null && new Date(session.expiresAt).getTime() > Date.now();
  });

  async login(email: string, password: string): Promise<boolean> {
    this.loadingState.set(true);
    this.errorState.set(null);

    try {
      const session = await firstValueFrom(this.repository.login(email, password));
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      this.sessionState.set(session);
      return true;
    } catch {
      this.errorState.set('El correo o la contraseña no son válidos.');
      return false;
    } finally {
      this.loadingState.set(false);
    }
  }

  logout(): void {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    this.sessionState.set(null);
  }
}
