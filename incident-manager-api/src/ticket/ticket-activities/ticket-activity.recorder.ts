import { Injectable } from '@nestjs/common';
import { TicketPriority, TicketStatus } from '@prisma/client';
import { TicketActivity } from './entities/ticket-activity.entity';
import {
  createAssigneeUpdatedActivity,
  createDescriptionUpdatedActivity,
  createIncidentLinkedActivity,
  createPriorityUpdatedActivity,
  createStatusUpdatedActivity,
  createTicketOpenedActivity,
  createTitleUpdatedActivity,
} from './ticket-activity.factory';
import { TicketActivityRepository } from './ticket-activity/ticket-activity.repository';

@Injectable()
export class TicketActivityRecorder {
  constructor(private readonly ticketActivityRepository: TicketActivityRepository) {}

  recordTicketOpened(
    ticketId: string,
    userId: string | null | undefined,
    priority: TicketPriority,
    status: TicketStatus,
  ): Promise<TicketActivity> {
    return this.ticketActivityRepository.create(
      createTicketOpenedActivity(ticketId, userId, { priority, status }),
    );
  }

  recordStatusUpdated(
    ticketId: string,
    userId: string | null | undefined,
    from: TicketStatus,
    to: TicketStatus,
  ): Promise<TicketActivity | null> {
    if (from === to) return Promise.resolve(null);
    return this.ticketActivityRepository.create(
      createStatusUpdatedActivity(ticketId, userId, { from, to }),
    );
  }

  recordPriorityUpdated(
    ticketId: string,
    userId: string | null | undefined,
    from: TicketPriority,
    to: TicketPriority,
  ): Promise<TicketActivity | null> {
    if (from === to) return Promise.resolve(null);
    return this.ticketActivityRepository.create(
      createPriorityUpdatedActivity(ticketId, userId, { from, to }),
    );
  }

  recordAssigneeUpdated(
    ticketId: string,
    userId: string | null | undefined,
    fromUserId: string | null,
    toUserId: string | null,
  ): Promise<TicketActivity | null> {
    if (fromUserId === toUserId) return Promise.resolve(null);
    return this.ticketActivityRepository.create(
      createAssigneeUpdatedActivity(ticketId, userId, { fromUserId, toUserId }),
    );
  }

  recordIncidentLinked(
    ticketId: string,
    userId: string | null | undefined,
    fromIncidentId: string | null,
    toIncidentId: string | null,
  ): Promise<TicketActivity | null> {
    if (fromIncidentId === toIncidentId) return Promise.resolve(null);
    return this.ticketActivityRepository.create(
      createIncidentLinkedActivity(ticketId, userId, {
        fromIncidentId,
        toIncidentId,
      }),
    );
  }

  recordDescriptionUpdated(
    ticketId: string,
    userId: string | null | undefined,
    from: string | null,
    to: string | null,
  ): Promise<TicketActivity | null> {
    if (from === to) return Promise.resolve(null);
    return this.ticketActivityRepository.create(
      createDescriptionUpdatedActivity(ticketId, userId, { from, to }),
    );
  }

  recordTitleUpdated(
    ticketId: string,
    userId: string | null | undefined,
    from: string,
    to: string,
  ): Promise<TicketActivity | null> {
    if (from === to) return Promise.resolve(null);
    return this.ticketActivityRepository.create(
      createTitleUpdatedActivity(ticketId, userId, { from, to }),
    );
  }
}
