import { TicketPriority, TicketStatus } from '@prisma/client';
import { IncidentBase } from 'src/incidents/entities/incident.entity';
import { User } from 'src/users/entities/user';

export { TicketPriority, TicketStatus };

export interface TicketTenantSummary {
  id: string;
  name: string;
  alias: string;
}

export type TicketAssignedUser = Pick<User, 'id' | 'fullName' | 'email'>;

export interface TicketBase {
  id: string;
  code: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  incidentId: string | null;
  assignedUser: TicketAssignedUser | null;
  incident: IncidentBase | null;
  tenant: TicketTenantSummary | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketDetailModel extends TicketBase {
  description: string | null;
}
