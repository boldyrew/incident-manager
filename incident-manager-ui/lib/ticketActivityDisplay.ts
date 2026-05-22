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

export function getActivityDescription(activity: TicketActivity): string {
  if (activity.plainData) return activity.plainData;

  switch (activity.type) {
    case 'TICKET_OPENED':
      return 'Ticket opened';
    case 'STATUS_UPDATED':
      return `Status changed from ${activity.metadata.from} to ${activity.metadata.to}`;
    case 'PRIORITY_UPDATED':
      return `Priority changed from ${activity.metadata.from} to ${activity.metadata.to}`;
    case 'ASSIGNEE_UPDATED':
      return 'Assignee updated';
    case 'INCIDENT_LINKED':
      return 'Incident link updated';
    case 'COMMENT_ADDED':
      return 'Comment added';
    case 'DESCRIPTION_UPDATED':
      return 'Description updated';
    case 'TITLE_UPDATED':
      return `Title changed from "${activity.metadata.from}" to "${activity.metadata.to}"`;
    default:
      return 'Activity recorded';
  }
}

export function getActivityContent(activity: TicketActivity): string | undefined {
  if (activity.type === 'COMMENT_ADDED') {
    return activity.metadata.body;
  }
  return undefined;
}
