import type { IncidentStatus } from '@/types/incident';

export const incidentStatusLabel: Record<IncidentStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};
