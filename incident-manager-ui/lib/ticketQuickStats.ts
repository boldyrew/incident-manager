import { formatDuration } from '@/lib/formatDuration';
import type { TicketStatus } from '@/types/ticket';
import type { TicketActivity } from '@/types/ticket-activity';

const TERMINAL_STATUSES: TicketStatus[] = ['RESOLVED', 'CLOSED'];

function countActivities(activities: TicketActivity[], type: TicketActivity['type']): number {
  return activities.filter((activity) => activity.type === type).length;
}

function getClosedAt(ticketStatus: TicketStatus, activities: TicketActivity[]): Date | null {
  if (!TERMINAL_STATUSES.includes(ticketStatus)) return null;

  const statusChanges = activities
    .filter(
      (activity): activity is Extract<TicketActivity, { type: 'STATUS_UPDATED' }> =>
        activity.type === 'STATUS_UPDATED' && TERMINAL_STATUSES.includes(activity.metadata.to),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return statusChanges[0] ? new Date(statusChanges[0].createdAt) : null;
}

export function getTimeOpenMs(
  createdAt: string,
  ticketStatus: TicketStatus,
  activities: TicketActivity[],
  now: Date = new Date(),
): number {
  const start = new Date(createdAt).getTime();
  const closedAt = getClosedAt(ticketStatus, activities);
  const end = closedAt?.getTime() ?? now.getTime();
  return end - start;
}

export function formatTimeOpen(
  createdAt: string,
  ticketStatus: TicketStatus,
  activities: TicketActivity[],
  now: Date = new Date(),
): string {
  return formatDuration(getTimeOpenMs(createdAt, ticketStatus, activities, now));
}

export function getTicketQuickStats(
  createdAt: string,
  ticketStatus: TicketStatus,
  activities: TicketActivity[],
  now: Date = new Date(),
) {
  return {
    timeOpen: formatTimeOpen(createdAt, ticketStatus, activities, now),
    comments: countActivities(activities, 'COMMENT_ADDED'),
    statusChanges: countActivities(activities, 'STATUS_UPDATED'),
  };
}
