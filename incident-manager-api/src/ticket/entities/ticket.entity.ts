import { User } from "src/users/entities/user";

export interface TicketTenantSummary {
  id: string;
  name: string;
  alias: string;
}

export interface TicketBase {
  code: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  incidentId: string | null;
  tenant: TicketTenantSummary | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketDetailModel extends TicketBase {
  description: string | null;
  assignedUser: Pick<User, 'id' | 'fullName' | 'email'>;
}
