import type { TicketStatus } from '@/types/ticket';

export const ticketStatusLabel: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};
