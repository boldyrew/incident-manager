import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IncidentsRepository } from '../incidents/incidents.repository';
import { makeIncident, makeTicket, makeUser, TENANT } from '../test-utils/fixtures';
import { UsersRepository } from '../users/users.repository';
import { TicketActivityRecorder } from './ticket-activities/ticket-activity.recorder';
import { TicketRepository } from './ticket.repository';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  let service: TicketService;
  let ticketRepository: Record<'create' | 'findAll' | 'findById' | 'update' | 'delete', jest.Mock>;
  let usersRepository: { findById: jest.Mock };
  let incidentsRepository: { findById: jest.Mock };
  let recorder: Record<keyof TicketActivityRecorder, jest.Mock>;

  const analyst = makeUser('ANALYST');
  const createDto = {
    title: 'Reset credentials',
    priority: 'HIGH' as const,
    status: 'OPEN' as const,
    tenantId: TENANT.id,
  };

  beforeEach(async () => {
    ticketRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    usersRepository = { findById: jest.fn() };
    incidentsRepository = { findById: jest.fn() };
    recorder = {
      recordTicketOpened: jest.fn(),
      recordStatusUpdated: jest.fn(),
      recordPriorityUpdated: jest.fn(),
      recordAssigneeUpdated: jest.fn(),
      recordIncidentLinked: jest.fn(),
      recordDescriptionUpdated: jest.fn(),
      recordTitleUpdated: jest.fn(),
      recordCommentAdded: jest.fn(),
    } as Record<keyof TicketActivityRecorder, jest.Mock>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: TicketRepository, useValue: ticketRepository },
        { provide: UsersRepository, useValue: usersRepository },
        { provide: IncidentsRepository, useValue: incidentsRepository },
        { provide: TicketActivityRecorder, useValue: recorder },
      ],
    }).compile();

    service = moduleRef.get(TicketService);
  });

  describe('create', () => {
    it('requires a tenantId for staff', async () => {
      await expect(
        service.create({ ...createDto, tenantId: undefined }, analyst),
      ).rejects.toThrow(new BadRequestException('tenantId is required'));
      expect(ticketRepository.create).not.toHaveBeenCalled();
    });

    it('creates the ticket and records the opening', async () => {
      const ticket = makeTicket();
      ticketRepository.create.mockResolvedValue(ticket);

      await expect(service.create(createDto, analyst)).resolves.toBe(ticket);

      expect(ticketRepository.create).toHaveBeenCalledWith(createDto, undefined);
      expect(recorder.recordTicketOpened).toHaveBeenCalledWith(
        ticket.id,
        analyst.sub,
        ticket.priority,
        ticket.status,
      );
    });

    it("uses a client user's tenant even without dto.tenantId", async () => {
      ticketRepository.create.mockResolvedValue(makeTicket());
      const dto = { ...createDto, tenantId: undefined };
      await service.create(dto, makeUser('CLIENT_USER'));
      expect(ticketRepository.create).toHaveBeenCalledWith(dto, TENANT.id);
    });
  });

  describe('findAll', () => {
    it('is unscoped for staff', async () => {
      await service.findAll(analyst);
      expect(ticketRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('is scoped for client users', async () => {
      await service.findAll(makeUser('CLIENT_USER'));
      expect(ticketRepository.findAll).toHaveBeenCalledWith(TENANT.id);
    });

    it('rejects client users without a tenant', () => {
      expect(() => service.findAll(makeUser('CLIENT_USER', { tenantId: null }))).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFound when missing', async () => {
      ticketRepository.findById.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow('Ticket missing not found');
    });
  });

  // NOTE: unlike IncidentsService.update, there is no existence check before updating.
  it('update delegates straight to the repository', async () => {
    await service.update('ticket-1', { title: 'x' });
    expect(ticketRepository.findById).not.toHaveBeenCalled();
    expect(ticketRepository.update).toHaveBeenCalledWith('ticket-1', { title: 'x' });
  });

  describe('updateTitle', () => {
    it('rejects a blank title', async () => {
      ticketRepository.findById.mockResolvedValue(makeTicket());
      await expect(service.updateTitle('ticket-1', ' ')).rejects.toThrow('Title is required');
    });

    it('is a no-op when unchanged', async () => {
      const ticket = makeTicket({ title: 'Same' });
      ticketRepository.findById.mockResolvedValue(ticket);
      await expect(service.updateTitle('ticket-1', 'Same ')).resolves.toBe(ticket);
      expect(ticketRepository.update).not.toHaveBeenCalled();
    });

    it('writes, records and re-reads the ticket', async () => {
      const after = makeTicket({ title: 'New' });
      ticketRepository.findById
        .mockResolvedValueOnce(makeTicket({ title: 'Old' }))
        .mockResolvedValueOnce(after);

      await expect(service.updateTitle('ticket-1', ' New ', analyst)).resolves.toBe(after);

      expect(ticketRepository.update).toHaveBeenCalledWith('ticket-1', { title: 'New' });
      expect(recorder.recordTitleUpdated).toHaveBeenCalledWith('ticket-1', analyst.sub, 'Old', 'New');
    });
  });

  describe('updateDescription', () => {
    it('is a no-op when the description is unchanged', async () => {
      const ticket = makeTicket({ description: 'Same' });
      ticketRepository.findById.mockResolvedValue(ticket);
      await expect(service.updateDescription('ticket-1', ' Same ')).resolves.toBe(ticket);
    });

    it('clears a description to null', async () => {
      ticketRepository.findById.mockResolvedValue(makeTicket({ description: 'Old' }));
      await service.updateDescription('ticket-1', '', analyst);
      expect(ticketRepository.update).toHaveBeenCalledWith('ticket-1', { description: null });
      expect(recorder.recordDescriptionUpdated).toHaveBeenCalledWith(
        'ticket-1',
        analyst.sub,
        'Old',
        null,
      );
    });
  });

  describe('remove', () => {
    it('deletes an existing ticket', async () => {
      ticketRepository.findById.mockResolvedValue(makeTicket());
      await service.remove('ticket-1');
      expect(ticketRepository.delete).toHaveBeenCalledWith('ticket-1');
    });

    it('does not delete a missing ticket', async () => {
      ticketRepository.findById.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
      expect(ticketRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('assign', () => {
    it('requires userId', async () => {
      await expect(service.assign('ticket-1', undefined)).rejects.toThrow(BadRequestException);
    });

    it.each([null, ''])('clears the assignment for %p', async (userId) => {
      await service.assign('ticket-1', userId, analyst);
      expect(ticketRepository.update).toHaveBeenCalledWith('ticket-1', { assignedUserId: null });
      expect(recorder.recordAssigneeUpdated).toHaveBeenCalledWith('ticket-1', analyst.sub, null);
    });

    it('rejects a non-analyst', async () => {
      usersRepository.findById.mockResolvedValue({ id: 'u-2', role: 'ADMIN' });
      await expect(service.assign('ticket-1', 'u-2', analyst)).rejects.toThrow(
        'User u-2 is not an analyst',
      );
    });

    it('assigns an analyst', async () => {
      usersRepository.findById.mockResolvedValue({ id: 'u-2', role: 'ANALYST' });
      await service.assign('ticket-1', 'u-2', analyst);
      expect(ticketRepository.update).toHaveBeenCalledWith('ticket-1', { assignedUserId: 'u-2' });
      expect(recorder.recordAssigneeUpdated).toHaveBeenCalledWith('ticket-1', analyst.sub, 'u-2');
    });
  });

  describe('linkIncident', () => {
    it('requires incidentId', async () => {
      await expect(service.linkIncident('ticket-1', undefined)).rejects.toThrow(
        'incidentId is required (use null to clear link)',
      );
    });

    it.each([null, ''])('clears the link for %p', async (incidentId) => {
      await service.linkIncident('ticket-1', incidentId, analyst);
      expect(ticketRepository.update).toHaveBeenCalledWith('ticket-1', { incidentId: null });
      expect(recorder.recordIncidentLinked).toHaveBeenCalledWith('ticket-1', analyst.sub, null);
    });

    it('rejects an incident from another tenant', async () => {
      incidentsRepository.findById.mockResolvedValue(
        makeIncident({ tenant: { id: 'other', name: 'Other', alias: 'other' } }),
      );
      ticketRepository.findById.mockResolvedValue(makeTicket());

      await expect(service.linkIncident('ticket-1', 'incident-1', analyst)).rejects.toThrow(
        'Invalid incident',
      );
      expect(ticketRepository.update).not.toHaveBeenCalled();
    });

    it('links an incident from the same tenant', async () => {
      const before = makeTicket();
      incidentsRepository.findById.mockResolvedValue(makeIncident());
      ticketRepository.findById.mockResolvedValue(before);

      const result = await service.linkIncident('ticket-1', 'incident-1', analyst);

      expect(ticketRepository.update).toHaveBeenCalledWith('ticket-1', { incidentId: 'incident-1' });
      expect(recorder.recordIncidentLinked).toHaveBeenCalledWith(
        'ticket-1',
        analyst.sub,
        'incident-1',
      );
      // NOTE: returns the ticket as read *before* the update, so incidentId is stale.
      expect(result).toBe(before);
    });
  });

  describe('setStatus', () => {
    it('is a no-op for the same status', async () => {
      ticketRepository.findById.mockResolvedValue(makeTicket({ status: 'OPEN' }));
      await service.setStatus('ticket-1', 'OPEN');
      expect(ticketRepository.update).not.toHaveBeenCalled();
    });

    it('updates and records a status change', async () => {
      ticketRepository.findById.mockResolvedValue(makeTicket({ status: 'OPEN' }));
      await service.setStatus('ticket-1', 'CLOSED', analyst);
      expect(ticketRepository.update).toHaveBeenCalledWith('ticket-1', { status: 'CLOSED' });
      expect(recorder.recordStatusUpdated).toHaveBeenCalledWith(
        'ticket-1',
        analyst.sub,
        'OPEN',
        'CLOSED',
      );
    });
  });

  describe('setPriority', () => {
    it('is a no-op for the same priority', async () => {
      ticketRepository.findById.mockResolvedValue(makeTicket({ priority: 'HIGH' }));
      await service.setPriority('ticket-1', 'HIGH');
      expect(ticketRepository.update).not.toHaveBeenCalled();
    });

    it('updates and records a priority change', async () => {
      ticketRepository.findById.mockResolvedValue(makeTicket({ priority: 'HIGH' }));
      await service.setPriority('ticket-1', 'LOW', analyst);
      expect(ticketRepository.update).toHaveBeenCalledWith('ticket-1', { priority: 'LOW' });
      expect(recorder.recordPriorityUpdated).toHaveBeenCalledWith(
        'ticket-1',
        analyst.sub,
        'HIGH',
        'LOW',
      );
    });
  });

  describe('addComment', () => {
    beforeEach(() => ticketRepository.findById.mockResolvedValue(makeTicket()));

    it('rejects a blank comment', async () => {
      await expect(service.addComment('ticket-1', ' ', analyst)).rejects.toThrow(
        'Comment body is required',
      );
    });

    it('records the trimmed comment', async () => {
      await service.addComment('ticket-1', ' done ', analyst);
      expect(recorder.recordCommentAdded).toHaveBeenCalledWith('ticket-1', analyst.sub, 'done');
    });
  });
});
