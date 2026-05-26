import { IncidentBase } from './incident';
import { User } from './user';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface TicketTenantSummary {
  id: string;
  name: string;
  alias: string;
}

export interface TicketBase {
  id: string;
  code: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  incidentId?: string | null;
  incident?: IncidentBase | null;
  tenant: TicketTenantSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetailModel extends TicketBase {
  description: string;
  assignedUser: Pick<User, 'id' | 'fullName' | 'email'> | null;
}
