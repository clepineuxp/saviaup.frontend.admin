import { firstValueFrom } from 'rxjs';
import { MockAdminAuthRepository } from './mock-admin-auth.repository';

describe('MockAdminAuthRepository', () => {
  const repository = new MockAdminAuthRepository();

  it('creates a temporary session with the development administrator', async () => {
    const session = await firstValueFrom(repository.login('admin@saviaup.local', 'Savia123*'));

    expect(session.administrator.email).toBe('admin@saviaup.local');
    expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('rejects invalid credentials without revealing which field failed', async () => {
    await expect(
      firstValueFrom(repository.login('unknown@saviaup.local', 'Wrong123*')),
    ).rejects.toThrow('ADMIN_INVALID_CREDENTIALS');
  });
});
