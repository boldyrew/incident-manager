import { IncidentSeverity, IncidentStatus } from '@prisma/client';
import {
  AssigneeUpdatedMetadata,
  CommentAddedMetadata,
  DescriptionUpdatedMetadata,
  IncidentOpenedMetadata,
  SeverityUpdatedMetadata,
  StatusUpdatedMetadata,
  TitleUpdatedMetadata,
} from '../entities/incident-activity.entity';

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

export function parseIncidentOpenedMetadata(raw: unknown): IncidentOpenedMetadata {
  const data = isRecord(raw) ? raw : {};
  return {
    severity: parseEnumValue(data.severity, Object.values(IncidentSeverity), 'severity'),
    status: parseEnumValue(data.status, Object.values(IncidentStatus), 'status'),
  };
}

export function parseStatusUpdatedMetadata(raw: unknown): StatusUpdatedMetadata {
  if (!isRecord(raw)) throw new Error('Invalid STATUS_UPDATED metadata');
  return {
    from: parseEnumValue(raw.from, Object.values(IncidentStatus), 'from'),
    to: parseEnumValue(raw.to, Object.values(IncidentStatus), 'to'),
  };
}

export function parseSeverityUpdatedMetadata(raw: unknown): SeverityUpdatedMetadata {
  if (!isRecord(raw)) throw new Error('Invalid SEVERITY_UPDATED metadata');
  return {
    from: parseEnumValue(raw.from, Object.values(IncidentSeverity), 'from'),
    to: parseEnumValue(raw.to, Object.values(IncidentSeverity), 'to'),
  };
}

export function parseAssigneeUpdatedMetadata(raw: unknown): AssigneeUpdatedMetadata {
  if (!isRecord(raw)) throw new Error('Invalid ASSIGNEE_UPDATED metadata');
  return {
    assignedUserId: parseNullableUserId(raw.assignedUserId, 'assignedUserId'),
  };
}

export function parseCommentAddedMetadata(raw: unknown): CommentAddedMetadata {
  if (!isRecord(raw)) throw new Error('Invalid COMMENT_ADDED metadata');
  return {
    body: parseRequiredString(raw.body, 'body'),
  };
}

export function parseDescriptionUpdatedMetadata(raw: unknown): DescriptionUpdatedMetadata {
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
