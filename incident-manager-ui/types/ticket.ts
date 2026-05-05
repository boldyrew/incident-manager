export type TicketSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface TicketBase {
  id: string;
  title: string;
  severity: TicketSeverity;
  status: TicketStatus;
  assignee: string;
  // linkedIncident: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetailModel extends TicketBase {
  description: string;

  // linkedIncidentTitle: string;
  // linkedIncidentSeverity: TicketSeverity;
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
