import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IncidentsRepository } from '../../../incidents/incidents.repository';
import { makeIncident, makeTicket } from '../../../test-utils/fixtures';
import { UsersRepository } from '../../../users/users.repository';
import { TicketRepository } from '../../ticket.repository';
import { TicketActivity } from '../entities/ticket-activity.entity';
import { TicketActivityRepository } from './ticket-activity.repository';
import { TicketActivityService } from './ticket-activity.service';

const base = {
  ticketId: 't-1',
  userId: 'u-1',
  actor: null,
  plainData: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TicketActivityService', () => {
  let service: TicketActivityService;
  let activityRepository: { findByTicketId: jest.Mock };
  let ticketRepository: { findById: jest.Mock };
  let usersRepository: { findById: jest.Mock };
  let incidentsRepository: { findById: jest.Mock };

  beforeEach(async () => {
    activityRepository = { findByTicketId: jest.fn() };
    ticketRepository = { findById: jest.fn().mockResolvedValue(makeTicket()) };
    usersRepository = { findById: jest.fn() };
    incidentsRepository = { findById: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TicketActivityService,
        { provide: TicketActivityRepository, useValue: activityRepository },
        { provide: TicketRepository, useValue: ticketRepository },
        { provide: UsersRepository, useValue: usersRepository },
        { provide: IncidentsRepository, useValue: incidentsRepository },
      ],
    }).compile();

    service = moduleRef.get(TicketActivityService);
  });

  it('throws NotFound for an unknown ticket', async () => {
    ticketRepository.findById.mockResolvedValue(null);
    await expect(service.findByTicketId('missing')).rejects.toThrow(NotFoundException);
  });

  it('enriches assignee and incident-link activities', async () => {
    const user = { id: 'u-2', fullName: 'Bob', email: 'bob@secureops.io', role: 'ANALYST' };
    const incident = makeIncident();
    usersRepository.findById.mockResolvedValue(user);
    incidentsRepository.findById.mockResolvedValue(incident);
    const activities: TicketActivity[] = [
      { ...base, id: 'a-1', type: 'ASSIGNEE_UPDATED', metadata: { assignedUserId: 'u-2' } },
      { ...base, id: 'a-2', type: 'ASSIGNEE_UPDATED', metadata: { assignedUserId: null } },
      { ...base, id: 'a-3', type: 'INCIDENT_LINKED', metadata: { incidentId: incident.id } },
      { ...base, id: 'a-4', type: 'INCIDENT_LINKED', metadata: { incidentId: null } },
      { ...base, id: 'a-5', type: 'TITLE_UPDATED', metadata: { from: 'a', to: 'b' } },
    ];
    activityRepository.findByTicketId.mockResolvedValue(activities);

    const result = await service.findByTicketId('t-1');

    expect(result[0].metadata).toEqual({ assignedUserId: 'u-2', assignedUser: user });
    expect(result[1].metadata).toEqual({ assignedUserId: null, assignedUser: null });
    expect(result[2].metadata).toEqual({ incidentId: incident.id, incident });
    expect(result[3].metadata).toEqual({ incidentId: null, incident: null });
    expect(result[4]).toBe(activities[4]);
    expect(usersRepository.findById).toHaveBeenCalledTimes(1);
    expect(incidentsRepository.findById).toHaveBeenCalledTimes(1);
  });
});
