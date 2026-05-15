export type UserRole = 'ADMIN' | 'ANALYST' | 'CLIENT_USER';

export interface TenantBase {
  id: string;
  name: string;
  alias: string;
}
