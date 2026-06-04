import { TenantBase } from 'src/common/types';
import { UserBase } from 'src/users/entities/user';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface IncidentBase {
  id: string;
  code: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  detectedAt: Date;
  resolvedAt: Date | null;
}

export interface Incident extends IncidentBase {
  description: string | null;
  client: string;
  assignedUser: UserBase | null;
  tenant: TenantBase | null;
}
