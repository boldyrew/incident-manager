import { Injectable, NotFoundException } from '@nestjs/common';
import { IncidentsRepository } from '../../incidents.repository';
import {
  IncidentActivity,
  IncidentActivityEnriched,
} from '../entities/incident-activity.entity';
import { IncidentActivityRepository } from './incident-activity.repository';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class IncidentActivityService {
  constructor(
    private readonly incidentActivityRepository: IncidentActivityRepository,
    private readonly incidentsRepository: IncidentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findByIncidentId(incidentId: string): Promise<IncidentActivityEnriched[]> {
    const incident = await this.incidentsRepository.findById(incidentId);
    if (!incident) {
      throw new NotFoundException(`Incident ${incidentId} not found`);
    }
    return this.enrichActivities(
      await this.incidentActivityRepository.findByIncidentId(incidentId),
    );
  }

  private async enrichActivities(
    activities: IncidentActivity[],
  ): Promise<IncidentActivityEnriched[]> {
    return Promise.all(activities.map(async (activity) => await this.enrichMetadata(activity)));
  }

  private async enrichMetadata(metadata: IncidentActivity): Promise<IncidentActivityEnriched> {
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
    return metadata;
  }
}
