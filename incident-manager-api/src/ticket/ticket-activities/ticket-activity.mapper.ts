import { Prisma, TicketActivityType } from '@prisma/client';
import { TicketActivity, TicketActivityActor } from './entities/ticket-activity.entity';
import {
  parseAssigneeUpdatedMetadata,
  parseCommentAddedMetadata,
  parseDescriptionUpdatedMetadata,
  parseIncidentLinkedMetadata,
  parsePriorityUpdatedMetadata,
  parseStatusUpdatedMetadata,
  parseTicketOpenedMetadata,
  parseTitleUpdatedMetadata,
} from './metadata/parse-metadata';

const activityUserSelect = {
  id: true,
  fullName: true,
  email: true,
} satisfies Prisma.UserSelect;

export const ticketActivitySelect = {
  id: true,
  type: true,
  userId: true,
  ticketId: true,
  plainData: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  user: { select: activityUserSelect },
} satisfies Prisma.TicketActivitySelect;

export type TicketActivityRecord = Prisma.TicketActivityGetPayload<{
  select: typeof ticketActivitySelect;
}>;

function assertNever(value: never): never {
  throw new Error(`Unhandled ticket activity type: ${value}`);
}

function mapActor(user: TicketActivityRecord['user']): TicketActivityActor | null {
  if (!user) return null;
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
}

function mapBase(record: TicketActivityRecord) {
  return {
    id: record.id,
    ticketId: record.ticketId,
    userId: record.userId,
    actor: mapActor(record.user),
    plainData: record.plainData,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function parseTicketActivity(record: TicketActivityRecord): TicketActivity {
  const base = mapBase(record);
  const metadata = record.metadata;

  switch (record.type) {
    case TicketActivityType.TICKET_OPENED:
      return {
        ...base,
        type: 'TICKET_OPENED',
        metadata: parseTicketOpenedMetadata(metadata),
      };
    case TicketActivityType.STATUS_UPDATED:
      return {
        ...base,
        type: 'STATUS_UPDATED',
        metadata: parseStatusUpdatedMetadata(metadata),
      };
    case TicketActivityType.PRIORITY_UPDATED:
      return {
        ...base,
        type: 'PRIORITY_UPDATED',
        metadata: parsePriorityUpdatedMetadata(metadata),
      };
    case TicketActivityType.ASSIGNEE_UPDATED:
      return {
        ...base,
        type: 'ASSIGNEE_UPDATED',
        metadata: parseAssigneeUpdatedMetadata(metadata),
      };
    case TicketActivityType.INCIDENT_LINKED:
      return {
        ...base,
        type: 'INCIDENT_LINKED',
        metadata: parseIncidentLinkedMetadata(metadata),
      };
    case TicketActivityType.COMMENT_ADDED:
      return {
        ...base,
        type: 'COMMENT_ADDED',
        metadata: parseCommentAddedMetadata(metadata),
      };
    case TicketActivityType.DESCRIPTION_UPDATED:
      return {
        ...base,
        type: 'DESCRIPTION_UPDATED',
        metadata: parseDescriptionUpdatedMetadata(metadata),
      };
    case TicketActivityType.TITLE_UPDATED:
      return {
        ...base,
        type: 'TITLE_UPDATED',
        metadata: parseTitleUpdatedMetadata(metadata),
      };
    default:
      return assertNever(record.type);
  }
}
