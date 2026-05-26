import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketActivity, TicketActivityEnriched } from '../entities/ticket-activity.entity';
import { TicketRepository } from '../../ticket.repository';
import { TicketActivityRepository } from './ticket-activity.repository';
import { UsersRepository } from 'src/users/users.repository';
import { IncidentsRepository } from 'src/incidents/incidents.repository';

@Injectable()
export class TicketActivityService {
  constructor(
    private readonly ticketActivityRepository: TicketActivityRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly usersRepository: UsersRepository,
    private readonly incidentsRepository: IncidentsRepository,
  ) {}

  async findByTicketId(ticketId: string): Promise<TicketActivityEnriched[]> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket ${ticketId} not found`);
    }
    return this.enrichActivities(await this.ticketActivityRepository.findByTicketId(ticketId));
  }

  private async enrichActivities(activities: TicketActivity[]): Promise<TicketActivityEnriched[]> {
    return Promise.all(activities.map(async (activity) => await this.enrichMetadata(activity)));
  }

  private async enrichMetadata(metadata: TicketActivity): Promise<TicketActivityEnriched> {
    if (metadata.type === 'ASSIGNEE_UPDATED') {
      return {
        ...metadata,
        metadata: {
          ...metadata.metadata,
          assignedUser: metadata.metadata.assignedUserId
            ? await this.usersRepository.findById(metadata.metadata.assignedUserId)
            : null,
        },
      };
    }
    if (metadata.type === 'INCIDENT_LINKED') {
      return {
        ...metadata,
        metadata: {
          ...metadata.metadata,
          incident: metadata.metadata.incidentId
            ? await this.incidentsRepository.findById(metadata.metadata.incidentId)
            : null,
        },
      };
    }
    return metadata;
  }
}
