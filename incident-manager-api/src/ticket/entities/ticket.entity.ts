import { TicketPriority, TicketStatus } from '@prisma/client';
import { IncidentBase } from 'src/incidents/entities/incident.entity';
import { User } from 'src/users/entities/user';

export { TicketPriority, TicketStatus };

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
  incidentId: string | null;
  tenant: TicketTenantSummary | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketDetailModel extends TicketBase {
  description: string | null;
  assignedUser: Pick<User, 'id' | 'fullName' | 'email'> | null;
  incident: IncidentBase | null;
}
