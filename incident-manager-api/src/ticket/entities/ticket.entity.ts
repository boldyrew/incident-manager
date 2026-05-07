
export interface TicketBase {
  code: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  // assignedTo: string | null;
  incidentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketDetailModel extends TicketBase {
  description: string | null;
}
