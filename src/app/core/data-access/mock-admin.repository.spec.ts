import { firstValueFrom } from 'rxjs';
import { MockAdminRepository } from './mock-admin.repository';

describe('MockAdminRepository', () => {
  const repository = new MockAdminRepository();

  it('returns users with tenant-aware memberships', async () => {
    const users = await firstValueFrom(repository.getUsers());
    const multiOrganizationUser = users.find((user) => user.id === 'usr-5');

    expect(users.length).toBeGreaterThan(0);
    expect(multiOrganizationUser?.memberships).toHaveLength(2);
    expect(multiOrganizationUser?.memberships.map((item) => item.organizationId)).toContain(
      'org-secret-garden',
    );
  });

  it('reactivates an inactive organization membership', async () => {
    const updated = await firstValueFrom(repository.setMembershipStatus('mem-6', true));

    expect(updated.memberships.find((item) => item.id === 'mem-6')?.isActive).toBe(true);
  });

  it('updates the tenant permission boundary', async () => {
    const updated = await firstValueFrom(
      repository.setTenantPermission('org-savia-demo', 'settings.roles.manage', true),
    );

    expect(
      updated.permissions.find((permission) => permission.code === 'settings.roles.manage')
        ?.enabled,
    ).toBe(true);
  });

  it('prevents moving an owner membership directly', async () => {
    await expect(
      firstValueFrom(
        repository.reassignMembership({
          userId: 'usr-1',
          membershipId: 'mem-1',
          targetOrganizationId: 'org-brasa-origen',
        }),
      ),
    ).rejects.toThrow('ADMIN_OWNER_CANNOT_BE_REASSIGNED');
  });

  it('updates every operational status rule parameter', async () => {
    const updated = await firstValueFrom(
      repository.updateOperationStatusSettings({
        inactivityRuleEnabled: true,
        inactivityThresholdMinutes: 45,
        inactivitySeverity: 'WARNING',
        cashRegisterRuleEnabled: false,
        cashRegisterSeverity: 'CRITICAL',
      }),
    );

    expect(updated.inactivityThresholdMinutes).toBe(45);
    expect(updated.inactivitySeverity).toBe('WARNING');
    expect(updated.cashRegisterRuleEnabled).toBe(false);
    expect(updated.cashRegisterSeverity).toBe('CRITICAL');
  });
});
