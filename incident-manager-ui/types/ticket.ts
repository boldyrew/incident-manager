export type TicketSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface TicketBase {
  id: string;
  title: string;
  severity: TicketSeverity;
  status: TicketStatus;
  assignedTo: string;
  linkedIncident: string;
  createdAt: string;
}
