import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../types/authenticated-user.type';

export function resolveScopedTenantId(user: AuthenticatedUser): string | undefined {
  if (user.role !== UserRole.CLIENT_USER) {
    return undefined;
  }
  if (!user.tenantId) {
    throw new ForbiddenException('Client users must be assigned to a tenant');
  }
  return user.tenantId;
}
