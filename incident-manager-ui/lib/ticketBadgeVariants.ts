import type { BadgeVariant } from '@/components/ui/badge';
import { TicketSeverity, TicketStatus } from '@/types/ticket';

export function getTicketSeverityBadgeVariant(severity: TicketSeverity): BadgeVariant {
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

export function getTicketStatusBadgeVariant(status: TicketStatus): BadgeVariant {
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
