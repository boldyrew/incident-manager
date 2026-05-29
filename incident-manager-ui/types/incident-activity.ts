import type { IncidentSeverity, IncidentStatus } from './incident';
import { UserBase } from './user';

export type IncidentActivityType =
  | 'INCIDENT_OPENED'
  | 'STATUS_UPDATED'
  | 'SEVERITY_UPDATED'
  | 'ASSIGNEE_UPDATED'
  | 'COMMENT_ADDED'
  | 'DESCRIPTION_UPDATED'
  | 'TITLE_UPDATED';

export interface IncidentActivityActor {
  id: string;
  fullName: string;
  email: string;
}

export interface IncidentActivityBase {
  id: string;
  incidentId: string | null;
  userId: string | null;
  actor: IncidentActivityActor | null;
  plainData: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentOpenedMetadata {
  severity: IncidentSeverity;
  status: IncidentStatus;
}

export interface StatusUpdatedMetadata {
  from: IncidentStatus;
  to: IncidentStatus;
}

export interface SeverityUpdatedMetadata {
  from: IncidentSeverity;
  to: IncidentSeverity;
}

export interface AssigneeUpdatedMetadata {
  assignedUserId: string | null;
  assignedUser: UserBase | null;
}

export interface CommentAddedMetadata {
  body: string;
}

export interface DescriptionUpdatedMetadata {
  from: string | null;
  to: string | null;
}

export interface TitleUpdatedMetadata {
  from: string;
  to: string;
}

export type IncidentActivity =
  | (IncidentActivityBase & { type: 'INCIDENT_OPENED'; metadata: IncidentOpenedMetadata })
  | (IncidentActivityBase & { type: 'STATUS_UPDATED'; metadata: StatusUpdatedMetadata })
  | (IncidentActivityBase & { type: 'SEVERITY_UPDATED'; metadata: SeverityUpdatedMetadata })
  | (IncidentActivityBase & { type: 'ASSIGNEE_UPDATED'; metadata: AssigneeUpdatedMetadata })
  | (IncidentActivityBase & { type: 'COMMENT_ADDED'; metadata: CommentAddedMetadata })
  | (IncidentActivityBase & { type: 'DESCRIPTION_UPDATED'; metadata: DescriptionUpdatedMetadata })
  | (IncidentActivityBase & { type: 'TITLE_UPDATED'; metadata: TitleUpdatedMetadata });
