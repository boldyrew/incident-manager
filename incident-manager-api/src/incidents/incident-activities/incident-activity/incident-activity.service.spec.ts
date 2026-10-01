import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { makeIncident } from '../../../test-utils/fixtures';
import { UsersRepository } from '../../../users/users.repository';
import { IncidentsRepository } from '../../incidents.repository';
import { IncidentActivity } from '../entities/incident-activity.entity';
import { IncidentActivityRepository } from './incident-activity.repository';
import { IncidentActivityService } from './incident-activity.service';

const base = {
  incidentId: 'inc-1',
  userId: 'u-1',
  actor: null,
  plainData: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('IncidentActivityService', () => {
  let service: IncidentActivityService;
  let activityRepository: { findByIncidentId: jest.Mock };
  let incidentsRepository: { findById: jest.Mock };
  let usersRepository: { findById: jest.Mock };

  beforeEach(async () => {
    activityRepository = { findByIncidentId: jest.fn() };
    incidentsRepository = { findById: jest.fn().mockResolvedValue(makeIncident()) };
    usersRepository = { findById: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        IncidentActivityService,
        { provide: IncidentActivityRepository, useValue: activityRepository },
        { provide: IncidentsRepository, useValue: incidentsRepository },
        { provide: UsersRepository, useValue: usersRepository },
      ],
    }).compile();

    service = moduleRef.get(IncidentActivityService);
  });

  it('throws NotFound for an unknown incident', async () => {
    incidentsRepository.findById.mockResolvedValue(null);
    await expect(service.findByIncidentId('missing')).rejects.toThrow(NotFoundException);
    expect(activityRepository.findByIncidentId).not.toHaveBeenCalled();
  });

  it('enriches ASSIGNEE_UPDATED activities with the assigned user', async () => {
    const user = { id: 'u-2', fullName: 'Bob', email: 'bob@secureops.io', role: 'ANALYST' };
    usersRepository.findById.mockResolvedValue(user);
    const activities: IncidentActivity[] = [
      { ...base, id: 'a-1', type: 'ASSIGNEE_UPDATED', metadata: { assignedUserId: 'u-2' } },
      { ...base, id: 'a-2', type: 'ASSIGNEE_UPDATED', metadata: { assignedUserId: null } },
      { ...base, id: 'a-3', type: 'COMMENT_ADDED', metadata: { body: 'hi' } },
    ];
    activityRepository.findByIncidentId.mockResolvedValue(activities);

    const result = await service.findByIncidentId('inc-1');

    expect(activityRepository.findByIncidentId).toHaveBeenCalledWith('inc-1');
    expect(usersRepository.findById).toHaveBeenCalledTimes(1);
    expect(usersRepository.findById).toHaveBeenCalledWith('u-2');
    expect(result[0].metadata).toEqual({ assignedUserId: 'u-2', assignedUser: user });
    expect(result[1].metadata).toEqual({ assignedUserId: null, assignedUser: null });
    expect(result[2]).toBe(activities[2]);
  });
});
