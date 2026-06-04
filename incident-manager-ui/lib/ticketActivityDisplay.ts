import type { TicketActivity, TicketActivityType } from '@/types/ticket-activity';

export type TicketActivityVisualType =
  | 'created'
  | 'status_change'
  | 'comment'
  | 'assigned'
  | 'updated';

export function getActivityVisualType(type: TicketActivityType): TicketActivityVisualType {
  switch (type) {
    case 'TICKET_OPENED':
      return 'created';
    case 'STATUS_UPDATED':
    case 'PRIORITY_UPDATED':
      return 'status_change';
    case 'ASSIGNEE_UPDATED':
      return 'assigned';
    case 'COMMENT_ADDED':
      return 'comment';
    default:
      return 'updated';
  }
}

export function getActivityActorName(activity: TicketActivity): string {
  return activity.actor?.fullName ?? 'System';
}

export function getActivityContent(activity: TicketActivity): string | undefined {
  if (activity.type === 'COMMENT_ADDED') {
    return activity.metadata.body;
  }
  return undefined;
}
