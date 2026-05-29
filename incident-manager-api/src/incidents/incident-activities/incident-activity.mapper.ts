import { Prisma } from '@prisma/client';
import {
  IncidentActivity,
  IncidentActivityActor,
  IncidentActivityType,
} from './entities/incident-activity.entity';
import {
  parseAssigneeUpdatedMetadata,
  parseCommentAddedMetadata,
  parseDescriptionUpdatedMetadata,
  parseIncidentOpenedMetadata,
  parseSeverityUpdatedMetadata,
  parseStatusUpdatedMetadata,
  parseTitleUpdatedMetadata,
} from './metadata/parse-metadata';

const activityUserSelect = {
  id: true,
  fullName: true,
  email: true,
} satisfies Prisma.UserSelect;

export const incidentActivitySelect = {
  id: true,
  type: true,
  userId: true,
  incidentId: true,
  plainData: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  user: { select: activityUserSelect },
} satisfies Prisma.IncidentActivitySelect;

export type IncidentActivityRecord = Prisma.IncidentActivityGetPayload<{
  select: typeof incidentActivitySelect;
}>;

function assertNever(value: never): never {
  throw new Error(`Unhandled incident activity type: ${value}`);
}

function mapActor(user: IncidentActivityRecord['user']): IncidentActivityActor | null {
  if (!user) return null;
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
}

function mapBase(record: IncidentActivityRecord) {
  return {
    id: record.id,
    incidentId: record.incidentId,
    userId: record.userId,
    actor: mapActor(record.user),
    plainData: record.plainData,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function parseIncidentActivity(record: IncidentActivityRecord): IncidentActivity {
  const base = mapBase(record);
  const metadata = record.metadata;

  switch (record.type) {
    case IncidentActivityType.INCIDENT_OPENED:
      return {
        ...base,
        type: 'INCIDENT_OPENED',
        metadata: parseIncidentOpenedMetadata(metadata),
      };
    case IncidentActivityType.STATUS_UPDATED:
      return {
        ...base,
        type: 'STATUS_UPDATED',
        metadata: parseStatusUpdatedMetadata(metadata),
      };
    case IncidentActivityType.SEVERITY_UPDATED:
      return {
        ...base,
        type: 'SEVERITY_UPDATED',
        metadata: parseSeverityUpdatedMetadata(metadata),
      };
    case IncidentActivityType.ASSIGNEE_UPDATED:
      return {
        ...base,
        type: 'ASSIGNEE_UPDATED',
        metadata: parseAssigneeUpdatedMetadata(metadata),
      };
    case IncidentActivityType.COMMENT_ADDED:
      return {
        ...base,
        type: 'COMMENT_ADDED',
        metadata: parseCommentAddedMetadata(metadata),
      };
    case IncidentActivityType.DESCRIPTION_UPDATED:
      return {
        ...base,
        type: 'DESCRIPTION_UPDATED',
        metadata: parseDescriptionUpdatedMetadata(metadata),
      };
    case IncidentActivityType.TITLE_UPDATED:
      return {
        ...base,
        type: 'TITLE_UPDATED',
        metadata: parseTitleUpdatedMetadata(metadata),
      };
    default:
      return assertNever(record.type as never);
  }
}
