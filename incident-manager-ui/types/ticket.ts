import { User } from "./user";

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface TicketTenantSummary {
  id: string;
  name: string;
  alias: string;
}

export interface TicketBase {
  code: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  incidentId?: string | null;
  tenant: TicketTenantSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetailModel extends TicketBase {
  description: string;
  assignedUser: Pick<User, 'id' | 'fullName' | 'email'> | null;
}

export type TicketActivityType = 'created' | 'assigned' | 'status_change' | 'comment';

export interface TicketActivityItem {
  id: number;
  type: TicketActivityType;
  user: string;
  action: string;
  timestamp: string;
  content?: string;
}
