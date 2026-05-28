export type TenantTier = 'ENTERPRISE' | 'PROFESSIONAL' | 'STARTER';
export type TenantStatus = 'ACTIVE' | 'INACTIVE';

export interface Tenant {
  id: string;
  name: string;
  alias: string;
  industry: string | null;
  tier: TenantTier;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
  openIncidents: number;
  criticalIncidents: number;
  resolvedThisMonth: number;
}

export interface TenantStats {
  totalClients: number;
  openIncidents: number;
  criticalIncidents: number;
  resolvedThisMonth: number;
}

export interface CreateTenantPayload {
  name: string;
  alias: string;
  industry?: string;
  tier?: TenantTier;
  status?: TenantStatus;
}
