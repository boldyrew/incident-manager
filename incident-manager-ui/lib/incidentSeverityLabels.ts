import type { IncidentSeverity } from '@/types/incident';

export const incidentSeverityLabel: Record<IncidentSeverity, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};
