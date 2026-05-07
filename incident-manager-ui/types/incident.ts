export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Incident {
  id: string;
  code: string;
  title: string;
  description?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  client: string;
  assignedTo?: string;
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentPayload {
  title: string;
  description?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  client: string;
  assignedTo?: string;
  detectedAt: string;
}

export type UpdateIncidentPayload = Partial<CreateIncidentPayload>;
