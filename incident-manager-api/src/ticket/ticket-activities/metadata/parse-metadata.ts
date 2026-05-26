import {
  TicketPriority,
  TicketStatus,
} from '@prisma/client';
import {
  AssigneeUpdatedMetadata,
  CommentAddedMetadata,
  DescriptionUpdatedMetadata,
  IncidentLinkedMetadata,
  PriorityUpdatedMetadata,
  StatusUpdatedMetadata,
  TicketOpenedMetadata,
  TitleUpdatedMetadata,
} from '../entities/ticket-activity.entity';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseEnumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new Error(`Invalid ${field} in activity metadata`);
  }
  return value as T;
}

function parseNullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${field} in activity metadata`);
  }
  return value;
}

function parseRequiredString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${field} in activity metadata`);
  }
  return value;
}

function parseNullableUserId(value: unknown, field: string): string | null {
  if (value === null) return null;
  return parseRequiredString(value, field);
}

export function parseTicketOpenedMetadata(raw: unknown): TicketOpenedMetadata {
  const data = isRecord(raw) ? raw : {};
  return {
    priority: parseEnumValue(
      data.priority,
      Object.values(TicketPriority),
      'priority',
    ),
    status: parseEnumValue(data.status, Object.values(TicketStatus), 'status'),
  };
}

export function parseStatusUpdatedMetadata(raw: unknown): StatusUpdatedMetadata {
  if (!isRecord(raw)) throw new Error('Invalid STATUS_UPDATED metadata');
  return {
    from: parseEnumValue(raw.from, Object.values(TicketStatus), 'from'),
    to: parseEnumValue(raw.to, Object.values(TicketStatus), 'to'),
  };
}

export function parsePriorityUpdatedMetadata(raw: unknown): PriorityUpdatedMetadata {
  if (!isRecord(raw)) throw new Error('Invalid PRIORITY_UPDATED metadata');
  return {
    from: parseEnumValue(raw.from, Object.values(TicketPriority), 'from'),
    to: parseEnumValue(raw.to, Object.values(TicketPriority), 'to'),
  };
}

export function parseAssigneeUpdatedMetadata(raw: unknown): AssigneeUpdatedMetadata {
  if (!isRecord(raw)) throw new Error('Invalid ASSIGNEE_UPDATED metadata');
  return {
    assignedUserId: parseNullableUserId(raw.assignedUserId, 'assignedUserId'),
  };
}

export function parseIncidentLinkedMetadata(raw: unknown): IncidentLinkedMetadata {
  if (!isRecord(raw)) throw new Error('Invalid INCIDENT_LINKED metadata');
  return {
    incidentId: parseNullableUserId(raw.incidentId, 'incidentId'),
  };
}

export function parseCommentAddedMetadata(raw: unknown): CommentAddedMetadata {
  if (!isRecord(raw)) throw new Error('Invalid COMMENT_ADDED metadata');
  return {
    body: parseRequiredString(raw.body, 'body'),
  };
}

export function parseDescriptionUpdatedMetadata(
  raw: unknown,
): DescriptionUpdatedMetadata {
  if (!isRecord(raw)) throw new Error('Invalid DESCRIPTION_UPDATED metadata');
  return {
    from: parseNullableString(raw.from, 'from'),
    to: parseNullableString(raw.to, 'to'),
  };
}

export function parseTitleUpdatedMetadata(raw: unknown): TitleUpdatedMetadata {
  if (!isRecord(raw)) throw new Error('Invalid TITLE_UPDATED metadata');
  return {
    from: parseRequiredString(raw.from, 'from'),
    to: parseRequiredString(raw.to, 'to'),
  };
}
