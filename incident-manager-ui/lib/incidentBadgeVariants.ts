import type { BadgeVariant } from '@/components/ui/badge';
import { IncidentSeverity, IncidentStatus } from '@/types/incident';

export function getIncidentSeverityBadgeVariant(severity: IncidentSeverity): BadgeVariant {
  switch (severity) {
    case 'CRITICAL':
      return 'critical';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'caution';
    case 'LOW':
      return 'info';
    default:
      return 'neutral';
  }
}

export function getIncidentStatusBadgeVariant(status: IncidentStatus): BadgeVariant {
  switch (status) {
    case 'OPEN':
      return 'info';
    case 'IN_PROGRESS':
      return 'caution';
    case 'RESOLVED':
      return 'success';
    case 'CLOSED':
      return 'neutral';
    default:
      return 'neutral';
  }
}
