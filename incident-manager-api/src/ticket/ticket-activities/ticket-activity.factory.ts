import { Prisma, TicketPriority, TicketStatus } from '@prisma/client';
import {
  AssigneeUpdatedMetadata,
  CommentAddedMetadata,
  DescriptionUpdatedMetadata,
  IncidentLinkedMetadata,
  PriorityUpdatedMetadata,
  StatusUpdatedMetadata,
  TicketOpenedMetadata,
  TitleUpdatedMetadata,
} from './entities/ticket-activity.entity';

type ActivityCreateInput = Prisma.TicketActivityUncheckedCreateInput;

function toActivityMetadata(metadata: object): Prisma.InputJsonValue {
  return metadata as Prisma.InputJsonValue;
}

function baseInput(ticketId: string, userId: string | null | undefined): Pick<
  ActivityCreateInput,
  'ticketId' | 'userId'
> {
  return {
    ticketId,
    userId: userId ?? null,
  };
}

export function createTicketOpenedActivity(
  ticketId: string,
  userId: string | null | undefined,
  metadata: TicketOpenedMetadata,
): ActivityCreateInput {
  return {
    ...baseInput(ticketId, userId),
    type: 'TICKET_OPENED',
    metadata: toActivityMetadata(metadata),
    plainData: `Ticket opened (${metadata.status}, ${metadata.priority} priority)`,
  };
}

export function createStatusUpdatedActivity(
  ticketId: string,
  userId: string | null | undefined,
  metadata: StatusUpdatedMetadata,
): ActivityCreateInput {
  return {
    ...baseInput(ticketId, userId),
    type: 'STATUS_UPDATED',
    metadata: toActivityMetadata(metadata),
    plainData: `Status changed from ${metadata.from} to ${metadata.to}`,
  };
}

export function createPriorityUpdatedActivity(
  ticketId: string,
  userId: string | null | undefined,
  metadata: PriorityUpdatedMetadata,
): ActivityCreateInput {
  return {
    ...baseInput(ticketId, userId),
    type: 'PRIORITY_UPDATED',
    metadata: toActivityMetadata(metadata),
    plainData: `Priority changed from ${metadata.from} to ${metadata.to}`,
  };
}

export function createAssigneeUpdatedActivity(
  ticketId: string,
  userId: string | null | undefined,
  metadata: AssigneeUpdatedMetadata,
): ActivityCreateInput {
  const fromLabel = metadata.fromUserId ?? 'unassigned';
  const toLabel = metadata.toUserId ?? 'unassigned';
  return {
    ...baseInput(ticketId, userId),
    type: 'ASSIGNEE_UPDATED',
    metadata: toActivityMetadata(metadata),
    plainData: `Assignee changed from ${fromLabel} to ${toLabel}`,
  };
}

export function createIncidentLinkedActivity(
  ticketId: string,
  userId: string | null | undefined,
  metadata: IncidentLinkedMetadata,
): ActivityCreateInput {
  const fromLabel = metadata.fromIncidentId ?? 'none';
  const toLabel = metadata.toIncidentId ?? 'none';
  return {
    ...baseInput(ticketId, userId),
    type: 'INCIDENT_LINKED',
    metadata: toActivityMetadata(metadata),
    plainData: `Incident link changed from ${fromLabel} to ${toLabel}`,
  };
}

export function createCommentAddedActivity(
  ticketId: string,
  userId: string | null | undefined,
  metadata: CommentAddedMetadata,
): ActivityCreateInput {
  return {
    ...baseInput(ticketId, userId),
    type: 'COMMENT_ADDED',
    metadata: toActivityMetadata(metadata),
    plainData: 'Comment added',
  };
}

export function createDescriptionUpdatedActivity(
  ticketId: string,
  userId: string | null | undefined,
  metadata: DescriptionUpdatedMetadata,
): ActivityCreateInput {
  return {
    ...baseInput(ticketId, userId),
    type: 'DESCRIPTION_UPDATED',
    metadata: toActivityMetadata(metadata),
    plainData: 'Description updated',
  };
}

export function createTitleUpdatedActivity(
  ticketId: string,
  userId: string | null | undefined,
  metadata: TitleUpdatedMetadata,
): ActivityCreateInput {
  return {
    ...baseInput(ticketId, userId),
    type: 'TITLE_UPDATED',
    metadata: toActivityMetadata(metadata),
    plainData: `Title changed from "${metadata.from}" to "${metadata.to}"`,
  };
}
