export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface IncidentBase {
  id: string;
  code: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  client: string;
  detectedAt: string;
}

export interface Incident extends IncidentBase {
  description?: string;
  assignedTo?: string;
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
