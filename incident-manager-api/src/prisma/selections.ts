import { Prisma } from '@prisma/client';

export const tenantSelect = {
  id: true,
  name: true,
  alias: true,
} satisfies Prisma.TenantSelect;
