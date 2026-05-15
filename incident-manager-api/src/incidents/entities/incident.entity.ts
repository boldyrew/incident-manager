import { TenantBase } from 'src/common/types';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface IncidentBase {
  id: string;
  code: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  detectedAt: Date;
}

export interface Incident extends IncidentBase {
  description: string | null;
  tenant: TenantBase;
}
