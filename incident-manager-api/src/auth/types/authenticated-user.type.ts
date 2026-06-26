import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  isDemo?: boolean;
}
