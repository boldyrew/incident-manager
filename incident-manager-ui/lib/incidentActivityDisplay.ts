import type { IncidentActivity, IncidentActivityType } from '@/types/incident-activity';

export type IncidentActivityVisualType =
  | 'created'
  | 'status_change'
  | 'comment'
  | 'assigned'
  | 'updated';

export function getActivityVisualType(type: IncidentActivityType): IncidentActivityVisualType {
  switch (type) {
    case 'INCIDENT_OPENED':
      return 'created';
    case 'STATUS_UPDATED':
    case 'SEVERITY_UPDATED':
      return 'status_change';
    case 'ASSIGNEE_UPDATED':
      return 'assigned';
    case 'COMMENT_ADDED':
      return 'comment';
    default:
      return 'updated';
  }
}

export function getActivityActorName(activity: IncidentActivity): string {
  return activity.actor?.fullName ?? 'System';
}

export function getActivityContent(activity: IncidentActivity): string | undefined {
  if (activity.type === 'COMMENT_ADDED') {
    return activity.metadata.body;
  }
  return undefined;
}
