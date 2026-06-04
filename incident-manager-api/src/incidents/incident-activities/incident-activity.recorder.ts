import { Injectable } from '@nestjs/common';
import { IncidentSeverity, IncidentStatus } from '../entities/incident.entity';
import { IncidentActivity } from './entities/incident-activity.entity';
import {
  createAssigneeUpdatedActivity,
  createCommentAddedActivity,
  createDescriptionUpdatedActivity,
  createIncidentOpenedActivity,
  createSeverityUpdatedActivity,
  createStatusUpdatedActivity,
  createTitleUpdatedActivity,
} from './incident-activity.factory';
import { IncidentActivityRepository } from './incident-activity/incident-activity.repository';

@Injectable()
export class IncidentActivityRecorder {
  constructor(private readonly incidentActivityRepository: IncidentActivityRepository) {}

  recordIncidentOpened(
    incidentId: string,
    userId: string | null | undefined,
    severity: IncidentSeverity,
    status: IncidentStatus,
  ): Promise<IncidentActivity> {
    return this.incidentActivityRepository.create(
      createIncidentOpenedActivity(incidentId, userId, { severity, status }),
    );
  }

  recordStatusUpdated(
    incidentId: string,
    userId: string | null | undefined,
    from: IncidentStatus,
    to: IncidentStatus,
  ): Promise<IncidentActivity | null> {
    if (from === to) return Promise.resolve(null);
    return this.incidentActivityRepository.create(
      createStatusUpdatedActivity(incidentId, userId, { from, to }),
    );
  }

  recordSeverityUpdated(
    incidentId: string,
    userId: string | null | undefined,
    from: IncidentSeverity,
    to: IncidentSeverity,
  ): Promise<IncidentActivity | null> {
    if (from === to) return Promise.resolve(null);
    return this.incidentActivityRepository.create(
      createSeverityUpdatedActivity(incidentId, userId, { from, to }),
    );
  }

  recordAssigneeUpdated(
    incidentId: string,
    userId: string | null | undefined,
    assignedUserId: string | null,
  ): Promise<IncidentActivity | null> {
    return this.incidentActivityRepository.create(
      createAssigneeUpdatedActivity(incidentId, userId, { assignedUserId }),
    );
  }

  recordDescriptionUpdated(
    incidentId: string,
    userId: string | null | undefined,
    from: string | null,
    to: string | null,
  ): Promise<IncidentActivity | null> {
    if (from === to) return Promise.resolve(null);
    return this.incidentActivityRepository.create(
      createDescriptionUpdatedActivity(incidentId, userId, { from, to }),
    );
  }

  recordTitleUpdated(
    incidentId: string,
    userId: string | null | undefined,
    from: string,
    to: string,
  ): Promise<IncidentActivity | null> {
    if (from === to) return Promise.resolve(null);
    return this.incidentActivityRepository.create(
      createTitleUpdatedActivity(incidentId, userId, { from, to }),
    );
  }

  recordCommentAdded(
    incidentId: string,
    userId: string | null | undefined,
    body: string,
  ): Promise<IncidentActivity> {
    return this.incidentActivityRepository.create(
      createCommentAddedActivity(incidentId, userId, { body }),
    );
  }
}
