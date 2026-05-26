import { IncidentBase } from "src/incidents/entities/incident.entity";
import { TicketPriority, TicketStatus } from "src/ticket/entities/ticket.entity";
import { UserBase } from "src/users/entities/user";


export interface TicketActivityActor {
  id: string;
  fullName: string;
  email: string;
}

export interface TicketActivityBase {
  id: string;
  ticketId: string | null;
  userId: string | null;
  actor: TicketActivityActor | null;
  plainData: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketOpenedMetadata {
  priority: TicketPriority;
  status: TicketStatus;
}

export interface StatusUpdatedMetadata {
  from: TicketStatus;
  to: TicketStatus;
}

export interface PriorityUpdatedMetadata {
  from: TicketPriority;
  to: TicketPriority;
}

export interface AssigneeUpdatedMetadata {
  assignedUserId: string | null;
}

export interface AssigneeUpdatedEnrichedMetadata extends AssigneeUpdatedMetadata {
  assignedUser: UserBase | null;
}

export interface IncidentLinkedMetadata {
  incidentId: string | null;
}

export interface IncidentLinkedEnrichedMetadata extends IncidentLinkedMetadata {
  incident: IncidentBase | null;
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

export enum TicketActivityType {
  TICKET_OPENED = 'TICKET_OPENED',
  STATUS_UPDATED = 'STATUS_UPDATED',
  PRIORITY_UPDATED = 'PRIORITY_UPDATED',
  ASSIGNEE_UPDATED = 'ASSIGNEE_UPDATED',
  INCIDENT_LINKED = 'INCIDENT_LINKED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  DESCRIPTION_UPDATED = 'DESCRIPTION_UPDATED',
  TITLE_UPDATED = 'TITLE_UPDATED',
}

export type TicketActivity =
  | (TicketActivityBase & { type: 'TICKET_OPENED'; metadata: TicketOpenedMetadata })
  | (TicketActivityBase & { type: 'STATUS_UPDATED'; metadata: StatusUpdatedMetadata })
  | (TicketActivityBase & { type: 'PRIORITY_UPDATED'; metadata: PriorityUpdatedMetadata })
  | (TicketActivityBase & { type: 'ASSIGNEE_UPDATED'; metadata: AssigneeUpdatedMetadata })
  | (TicketActivityBase & { type: 'INCIDENT_LINKED'; metadata: IncidentLinkedMetadata })
  | (TicketActivityBase & { type: 'COMMENT_ADDED'; metadata: CommentAddedMetadata })
  | (TicketActivityBase & { type: 'DESCRIPTION_UPDATED'; metadata: DescriptionUpdatedMetadata })
  | (TicketActivityBase & { type: 'TITLE_UPDATED'; metadata: TitleUpdatedMetadata });

export type TicketActivityEnriched =
  | Exclude<TicketActivity, { type: 'INCIDENT_LINKED' | 'ASSIGNEE_UPDATED' }>
  | (TicketActivityBase & { type: 'INCIDENT_LINKED'; metadata: IncidentLinkedEnrichedMetadata })
  | (TicketActivityBase & { type: 'ASSIGNEE_UPDATED'; metadata: AssigneeUpdatedEnrichedMetadata });
