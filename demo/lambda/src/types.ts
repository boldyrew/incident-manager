export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Status = 'OPEN' | 'IN_PROGRESS';
export type IncidentType =
  | 'UNAUTHORIZED_ACCESS'
  | 'PHISHING'
  | 'MALWARE'
  | 'DATA_BREACH'
  | 'SERVICE_OUTAGE'
  | 'OTHER';

export interface GeneratedIncident {
  title: string;
  description: string;
  type: IncidentType;
}

export interface LambdaEvent {
  severity?: Severity;
  status?: Status;
}
