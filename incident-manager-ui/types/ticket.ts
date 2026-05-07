export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface TicketBase {
  code: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetailModel extends TicketBase {
  description: string;
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
