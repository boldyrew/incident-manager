import { ForbiddenException } from '@nestjs/common';
import { makeUser } from '../../test-utils/fixtures';
import { resolveScopedTenantId } from './scoped-tenant';

describe('resolveScopedTenantId', () => {
  it.each(['ADMIN', 'ANALYST'] as const)('returns undefined for %s', (role) => {
    expect(resolveScopedTenantId(makeUser(role, { tenantId: 'tenant-x' }))).toBeUndefined();
  });

  it('returns the tenant id for a client user', () => {
    expect(resolveScopedTenantId(makeUser('CLIENT_USER', { tenantId: 'tenant-1' }))).toBe(
      'tenant-1',
    );
  });

  it('throws Forbidden for a client user without a tenant', () => {
    expect(() => resolveScopedTenantId(makeUser('CLIENT_USER', { tenantId: null }))).toThrow(
      ForbiddenException,
    );
  });
});
