import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AdminStore } from '../../core/store/admin.store';
import { MembershipSummary, PlatformUser } from '../../core/models/admin.models';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';

type UserFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-users',
  imports: [DatePipe, AppIconComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly search = signal('');
  readonly filter = signal<UserFilter>('ALL');
  readonly selectedUserId = signal<string | null>(null);
  readonly membershipToMove = signal<string>('');
  readonly targetOrganizationId = signal<string>('');
  readonly resetConfirmation = signal(false);

  readonly selectedUser = computed(() => {
    const id = this.selectedUserId();
    return this.store.users().find((user) => user.id === id) ?? null;
  });

  readonly filteredUsers = computed(() => {
    const query = this.search().trim().toLowerCase();
    const filter = this.filter();
    return this.store.users().filter((user) => {
      const matchesQuery =
        !query ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.memberships.some((membership) =>
          membership.organizationName.toLowerCase().includes(query),
        );
      const hasActiveMembership = user.memberships.some((item) => item.isActive);
      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'ACTIVE' && hasActiveMembership) ||
        (filter === 'INACTIVE' && !hasActiveMembership);
      return matchesQuery && matchesFilter;
    });
  });

  readonly movableMemberships = computed(() =>
    (this.selectedUser()?.memberships ?? []).filter((item) => item.roleCode !== 'TENANT_OWNER'),
  );

  readonly targetOrganizations = computed(() => {
    const user = this.selectedUser();
    if (!user) return [];
    const currentIds = new Set(user.memberships.map((item) => item.organizationId));
    return this.store.organizations().filter((item) => item.isActive && !currentIds.has(item.id));
  });

  ngOnInit(): void {
    void Promise.all([this.store.loadUsers(), this.store.loadOrganizations()]);
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  onFilter(event: Event): void {
    this.filter.set((event.target as HTMLSelectElement).value as UserFilter);
  }

  onMembershipToMove(event: Event): void {
    this.membershipToMove.set((event.target as HTMLSelectElement).value);
  }

  onTargetOrganization(event: Event): void {
    this.targetOrganizationId.set((event.target as HTMLSelectElement).value);
  }

  openUser(user: PlatformUser): void {
    this.selectedUserId.set(user.id);
    this.membershipToMove.set(this.movableMemberships()[0]?.id ?? '');
    this.targetOrganizationId.set(this.targetOrganizations()[0]?.id ?? '');
    this.resetConfirmation.set(false);
    this.store.clearNotice();
  }

  closeUser(): void {
    this.selectedUserId.set(null);
    this.resetConfirmation.set(false);
    this.store.clearNotice();
  }

  initials(user: PlatformUser): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  membershipStatus(membership: MembershipSummary): string {
    return membership.isActive ? 'Activa' : 'Deshabilitada';
  }

  async resetPassword(user: PlatformUser): Promise<void> {
    if (!this.resetConfirmation()) {
      this.resetConfirmation.set(true);
      return;
    }
    await this.store.requestPasswordReset(user);
    this.resetConfirmation.set(false);
  }

  async reassign(user: PlatformUser): Promise<void> {
    const membershipId = this.membershipToMove();
    const targetOrganizationId = this.targetOrganizationId();
    if (!membershipId || !targetOrganizationId) return;
    await this.store.reassignMembership({ userId: user.id, membershipId, targetOrganizationId });
    this.membershipToMove.set(this.movableMemberships()[0]?.id ?? '');
    this.targetOrganizationId.set(this.targetOrganizations()[0]?.id ?? '');
  }
}
