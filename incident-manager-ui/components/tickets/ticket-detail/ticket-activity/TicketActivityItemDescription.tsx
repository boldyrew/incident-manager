import { UserItem } from '@/components/user/UserItem';
import { TicketActivity } from '@/types/ticket-activity';

export interface TicketActivityItemDescriptionProps {
  activity: TicketActivity;
}

function getActivityDescription(activity: TicketActivity): React.ReactNode | string {
  if (activity.plainData) return activity.plainData;

  console.log(activity);

  switch (activity.type) {
    case 'TICKET_OPENED':
      return 'Ticket opened';
    case 'STATUS_UPDATED':
      return `Status changed from ${activity.metadata.from} to ${activity.metadata.to}`;
    case 'PRIORITY_UPDATED':
      return `Priority changed from ${activity.metadata.from} to ${activity.metadata.to}`;
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

export function TicketActivityItemDescription({ activity }: TicketActivityItemDescriptionProps) {
  return <span className="text-muted-foreground"> • {getActivityDescription(activity)}</span>;
}
