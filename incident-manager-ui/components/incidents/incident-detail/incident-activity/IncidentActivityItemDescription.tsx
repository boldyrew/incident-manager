import { UserItem } from '@/components/user/UserItem';
import { IncidentActivity } from '@/types/incident-activity';

export interface IncidentActivityItemDescriptionProps {
  activity: IncidentActivity;
}

function getActivityDescription(activity: IncidentActivity): React.ReactNode | string {
  if (activity.plainData) return activity.plainData;

  switch (activity.type) {
    case 'INCIDENT_OPENED':
      return 'Incident opened';
    case 'STATUS_UPDATED':
      return `Status changed from ${activity.metadata.from} to ${activity.metadata.to}`;
    case 'SEVERITY_UPDATED':
      return `Severity changed from ${activity.metadata.from} to ${activity.metadata.to}`;
    case 'ASSIGNEE_UPDATED':
      return (
        <>
          {activity.metadata.assignedUser ? (
            <>
              Updated assignee to <UserItem user={activity.metadata.assignedUser} type="compact" />
            </>
          ) : (
            <>Removed assignee</>
          )}
        </>
      );
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

export function IncidentActivityItemDescription({ activity }: IncidentActivityItemDescriptionProps) {
  return <span className="text-muted-foreground"> • {getActivityDescription(activity)}</span>;
}
