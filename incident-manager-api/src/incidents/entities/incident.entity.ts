import { IncidentSeverity, IncidentStatus } from '@prisma/client';

export interface Incident {
  id: string;
  incidentId: string;
  title: string;
  description: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  client: string;
  assignedTo: string | null;
  detectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
