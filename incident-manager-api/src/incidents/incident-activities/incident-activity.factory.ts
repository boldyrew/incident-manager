import { Prisma } from '@prisma/client';
import {
  AssigneeUpdatedMetadata,
  CommentAddedMetadata,
  DescriptionUpdatedMetadata,
  IncidentOpenedMetadata,
  SeverityUpdatedMetadata,
  StatusUpdatedMetadata,
  TitleUpdatedMetadata,
} from './entities/incident-activity.entity';

type ActivityCreateInput = Prisma.IncidentActivityUncheckedCreateInput;

function toActivityMetadata(metadata: object): Prisma.InputJsonValue {
  return metadata as Prisma.InputJsonValue;
}

function baseInput(
  incidentId: string,
  userId: string | null | undefined,
): Pick<Prisma.IncidentActivityUncheckedCreateInput, 'incidentId' | 'userId'> {
  return {
    incidentId,
    userId: userId ?? null,
  };
}

export function createIncidentOpenedActivity(
  incidentId: string,
  userId: string | null | undefined,
  metadata: IncidentOpenedMetadata,
): ActivityCreateInput {
  return {
    ...baseInput(incidentId, userId),
    type: 'INCIDENT_OPENED',
    metadata: toActivityMetadata(metadata),
    plainData: `Incident opened (${metadata.status}, ${metadata.severity} severity)`,
  };
}

export function createStatusUpdatedActivity(
  incidentId: string,
  userId: string | null | undefined,
  metadata: StatusUpdatedMetadata,
): ActivityCreateInput {
  return {
    ...baseInput(incidentId, userId),
    type: 'STATUS_UPDATED',
    metadata: toActivityMetadata(metadata),
    plainData: `Status changed from ${metadata.from} to ${metadata.to}`,
  };
}

export function createSeverityUpdatedActivity(
  incidentId: string,
  userId: string | null | undefined,
  metadata: SeverityUpdatedMetadata,
): ActivityCreateInput {
  return {
    ...baseInput(incidentId, userId),
    type: 'SEVERITY_UPDATED',
    metadata: toActivityMetadata(metadata),
    plainData: `Severity changed from ${metadata.from} to ${metadata.to}`,
  };
}

export function createAssigneeUpdatedActivity(
  incidentId: string,
  userId: string | null | undefined,
  metadata: AssigneeUpdatedMetadata,
): ActivityCreateInput {
  return {
    ...baseInput(incidentId, userId),
    type: 'ASSIGNEE_UPDATED',
    metadata: toActivityMetadata(metadata),
  };
}

export function createCommentAddedActivity(
  incidentId: string,
  userId: string | null | undefined,
  metadata: CommentAddedMetadata,
): ActivityCreateInput {
  return {
    ...baseInput(incidentId, userId),
    type: 'COMMENT_ADDED',
    metadata: toActivityMetadata(metadata),
    plainData: 'Comment added',
  };
}

export function createDescriptionUpdatedActivity(
  incidentId: string,
  userId: string | null | undefined,
  metadata: DescriptionUpdatedMetadata,
): ActivityCreateInput {
  return {
    ...baseInput(incidentId, userId),
    type: 'DESCRIPTION_UPDATED',
    metadata: toActivityMetadata(metadata),
    plainData: 'Description updated',
  };
}

export function createTitleUpdatedActivity(
  incidentId: string,
  userId: string | null | undefined,
  metadata: TitleUpdatedMetadata,
): ActivityCreateInput {
  return {
    ...baseInput(incidentId, userId),
    type: 'TITLE_UPDATED',
    metadata: toActivityMetadata(metadata),
    plainData: `Title changed from "${metadata.from}" to "${metadata.to}"`,
  };
}
