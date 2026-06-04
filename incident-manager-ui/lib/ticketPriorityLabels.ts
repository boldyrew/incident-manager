import type { TicketPriority } from '@/types/ticket';

export const ticketPriorityLabel: Record<TicketPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};
