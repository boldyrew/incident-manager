import type { TicketPriority, TicketStatus } from './ticket';
import { UserBase } from './user';

export type TicketActivityType =
  | 'TICKET_OPENED'
  | 'STATUS_UPDATED'
  | 'PRIORITY_UPDATED'
  | 'ASSIGNEE_UPDATED'
  | 'INCIDENT_LINKED'
  | 'COMMENT_ADDED'
  | 'DESCRIPTION_UPDATED'
  | 'TITLE_UPDATED';

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
  createdAt: string;
  updatedAt: string;
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
  assignedUser: UserBase | null;
}

export interface IncidentLinkedMetadata {
  fromIncidentId: string | null;
  toIncidentId: string | null;
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

export type TicketActivity =
  | (TicketActivityBase & { type: 'TICKET_OPENED'; metadata: TicketOpenedMetadata })
  | (TicketActivityBase & { type: 'STATUS_UPDATED'; metadata: StatusUpdatedMetadata })
  | (TicketActivityBase & { type: 'PRIORITY_UPDATED'; metadata: PriorityUpdatedMetadata })
  | (TicketActivityBase & { type: 'ASSIGNEE_UPDATED'; metadata: AssigneeUpdatedMetadata })
  | (TicketActivityBase & { type: 'INCIDENT_LINKED'; metadata: IncidentLinkedMetadata })
  | (TicketActivityBase & { type: 'COMMENT_ADDED'; metadata: CommentAddedMetadata })
  | (TicketActivityBase & { type: 'DESCRIPTION_UPDATED'; metadata: DescriptionUpdatedMetadata })
  | (TicketActivityBase & { type: 'TITLE_UPDATED'; metadata: TitleUpdatedMetadata });
