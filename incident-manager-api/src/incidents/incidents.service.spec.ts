import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { makeIncident, makeUser, TENANT } from '../test-utils/fixtures';
import { UsersRepository } from '../users/users.repository';
import { IncidentActivityRecorder } from './incident-activities/incident-activity.recorder';
import { IncidentsRepository } from './incidents.repository';
import { IncidentsService } from './incidents.service';

describe('IncidentsService', () => {
  let service: IncidentsService;
  let incidentsRepository: Record<'create' | 'findAll' | 'findById' | 'update' | 'delete', jest.Mock>;
  let usersRepository: { findById: jest.Mock };
  let recorder: Record<keyof IncidentActivityRecorder, jest.Mock>;

  const analyst = makeUser('ANALYST');
  const createDto = {
    title: 'Malware detected on endpoint',
    severity: 'CRITICAL' as const,
    status: 'OPEN' as const,
    client: TENANT.name,
    detectedAt: '2026-01-01T10:00:00.000Z',
  };

  beforeEach(async () => {
    incidentsRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    usersRepository = { findById: jest.fn() };
    recorder = {
      recordIncidentOpened: jest.fn(),
      recordStatusUpdated: jest.fn(),
      recordSeverityUpdated: jest.fn(),
      recordAssigneeUpdated: jest.fn(),
      recordDescriptionUpdated: jest.fn(),
      recordTitleUpdated: jest.fn(),
      recordCommentAdded: jest.fn(),
    } as Record<keyof IncidentActivityRecorder, jest.Mock>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: IncidentsRepository, useValue: incidentsRepository },
        { provide: UsersRepository, useValue: usersRepository },
        { provide: IncidentActivityRecorder, useValue: recorder },
      ],
    }).compile();

    service = moduleRef.get(IncidentsService);
  });

  describe('create', () => {
    it('creates an unscoped incident for staff and records the opening', async () => {
      const incident = makeIncident({ severity: 'CRITICAL', status: 'OPEN' });
      incidentsRepository.create.mockResolvedValue(incident);

      await expect(service.create(createDto, analyst)).resolves.toBe(incident);

      expect(incidentsRepository.create).toHaveBeenCalledWith(createDto, { tenantId: undefined });
      expect(recorder.recordIncidentOpened).toHaveBeenCalledWith(
        incident.id,
        analyst.sub,
        'CRITICAL',
        'OPEN',
      );
    });

    it("scopes a client user's incident to their tenant", async () => {
      incidentsRepository.create.mockResolvedValue(makeIncident());
      await service.create(createDto, makeUser('CLIENT_USER'));
      expect(incidentsRepository.create).toHaveBeenCalledWith(createDto, { tenantId: TENANT.id });
    });

    it('rejects a client user without a tenant', async () => {
      await expect(
        service.create(createDto, makeUser('CLIENT_USER', { tenantId: null })),
      ).rejects.toThrow(ForbiddenException);
      expect(incidentsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('passes the tenant filter through for staff', async () => {
      const filters = { severity: 'HIGH' as const, tenantId: 'tenant-9' };
      await service.findAll(filters, makeUser('ADMIN'));
      expect(incidentsRepository.findAll).toHaveBeenCalledWith(filters, 'tenant-9');
    });

    it("forces a client user to their own tenant", async () => {
      const filters = { tenantId: 'other-tenant' };
      await service.findAll(filters, makeUser('CLIENT_USER'));
      expect(incidentsRepository.findAll).toHaveBeenCalledWith(filters, TENANT.id);
    });

    it('defaults filters to an empty object', async () => {
      await service.findAll(undefined, analyst);
      expect(incidentsRepository.findAll).toHaveBeenCalledWith({}, undefined);
    });
  });

  describe('findOne', () => {
    it('returns the incident', async () => {
      const incident = makeIncident();
      incidentsRepository.findById.mockResolvedValue(incident);
      await expect(service.findOne(incident.id)).resolves.toBe(incident);
    });

    it('throws NotFound when missing', async () => {
      incidentsRepository.findById.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(
        new NotFoundException('Incident missing not found'),
      );
    });
  });

  describe('update', () => {
    it('updates an existing incident', async () => {
      incidentsRepository.findById.mockResolvedValue(makeIncident());
      incidentsRepository.update.mockResolvedValue(makeIncident({ title: 'New' }));
      await service.update('incident-1', { title: 'New' });
      expect(incidentsRepository.update).toHaveBeenCalledWith('incident-1', { title: 'New' });
    });

    it('does not update a missing incident', async () => {
      incidentsRepository.findById.mockResolvedValue(null);
      await expect(service.update('missing', { title: 'x' })).rejects.toThrow(NotFoundException);
      expect(incidentsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('updateTitle', () => {
    it('rejects a blank title', async () => {
      incidentsRepository.findById.mockResolvedValue(makeIncident());
      await expect(service.updateTitle('incident-1', '   ', analyst)).rejects.toThrow(
        new BadRequestException('Title is required'),
      );
    });

    it('is a no-op when the trimmed title is unchanged', async () => {
      const incident = makeIncident({ title: 'Same' });
      incidentsRepository.findById.mockResolvedValue(incident);
      await expect(service.updateTitle('incident-1', '  Same ', analyst)).resolves.toBe(incident);
      expect(incidentsRepository.update).not.toHaveBeenCalled();
      expect(recorder.recordTitleUpdated).not.toHaveBeenCalled();
    });

    it('writes the trimmed title, records it and returns the fresh incident', async () => {
      const after = makeIncident({ title: 'New title' });
      incidentsRepository.findById
        .mockResolvedValueOnce(makeIncident({ title: 'Old' }))
        .mockResolvedValueOnce(after);

      await expect(service.updateTitle('incident-1', ' New title ', analyst)).resolves.toBe(after);

      expect(incidentsRepository.update).toHaveBeenCalledWith('incident-1', { title: 'New title' });
      expect(recorder.recordTitleUpdated).toHaveBeenCalledWith(
        'incident-1',
        analyst.sub,
        'Old',
        'New title',
      );
    });
  });

  describe('updateDescription', () => {
    it('stores a blank description as null', async () => {
      incidentsRepository.findById.mockResolvedValue(makeIncident({ description: 'Old' }));
      await service.updateDescription('incident-1', '   ', analyst);
      expect(incidentsRepository.update).toHaveBeenCalledWith('incident-1', { description: null });
      expect(recorder.recordDescriptionUpdated).toHaveBeenCalledWith(
        'incident-1',
        analyst.sub,
        'Old',
        null,
      );
    });

    it('is a no-op when clearing an already empty description', async () => {
      const incident = makeIncident({ description: null });
      incidentsRepository.findById.mockResolvedValue(incident);
      await expect(service.updateDescription('incident-1', undefined)).resolves.toBe(incident);
      expect(incidentsRepository.update).not.toHaveBeenCalled();
    });

    it('records an undefined actor when none is given', async () => {
      incidentsRepository.findById.mockResolvedValue(makeIncident({ description: null }));
      await service.updateDescription('incident-1', 'New');
      expect(recorder.recordDescriptionUpdated).toHaveBeenCalledWith(
        'incident-1',
        undefined,
        null,
        'New',
      );
    });
  });

  describe('setStatus', () => {
    it('is a no-op for the same status', async () => {
      const incident = makeIncident({ status: 'OPEN' });
      incidentsRepository.findById.mockResolvedValue(incident);
      await expect(service.setStatus('incident-1', 'OPEN', analyst)).resolves.toBe(incident);
      expect(incidentsRepository.update).not.toHaveBeenCalled();
    });

    it('updates and records a status change', async () => {
      const updated = makeIncident({ status: 'RESOLVED' });
      incidentsRepository.findById.mockResolvedValue(makeIncident({ status: 'OPEN' }));
      incidentsRepository.update.mockResolvedValue(updated);

      await expect(service.setStatus('incident-1', 'RESOLVED', analyst)).resolves.toBe(updated);

      expect(incidentsRepository.update).toHaveBeenCalledWith('incident-1', { status: 'RESOLVED' });
      expect(recorder.recordStatusUpdated).toHaveBeenCalledWith(
        'incident-1',
        analyst.sub,
        'OPEN',
        'RESOLVED',
      );
    });
  });

  describe('setSeverity', () => {
    it('is a no-op for the same severity', async () => {
      incidentsRepository.findById.mockResolvedValue(makeIncident({ severity: 'HIGH' }));
      await service.setSeverity('incident-1', 'HIGH', analyst);
      expect(incidentsRepository.update).not.toHaveBeenCalled();
    });

    it('updates and records a severity change', async () => {
      incidentsRepository.findById.mockResolvedValue(makeIncident({ severity: 'HIGH' }));
      await service.setSeverity('incident-1', 'CRITICAL', analyst);
      expect(incidentsRepository.update).toHaveBeenCalledWith('incident-1', {
        severity: 'CRITICAL',
      });
      expect(recorder.recordSeverityUpdated).toHaveBeenCalledWith(
        'incident-1',
        analyst.sub,
        'HIGH',
        'CRITICAL',
      );
    });
  });

  describe('assign', () => {
    beforeEach(() => incidentsRepository.findById.mockResolvedValue(makeIncident()));

    it('requires userId to be provided', async () => {
      await expect(service.assign('incident-1', undefined, analyst)).rejects.toThrow(
        BadRequestException,
      );
      expect(incidentsRepository.findById).not.toHaveBeenCalled();
    });

    it.each([null, ''])('clears the assignment for %p', async (userId) => {
      await service.assign('incident-1', userId, analyst);
      expect(incidentsRepository.update).toHaveBeenCalledWith('incident-1', {
        assignedUserId: null,
      });
      expect(recorder.recordAssigneeUpdated).toHaveBeenCalledWith('incident-1', analyst.sub, null);
      expect(usersRepository.findById).not.toHaveBeenCalled();
    });

    it('rejects a target user who is not an analyst', async () => {
      usersRepository.findById.mockResolvedValue({ id: 'u-2', role: 'CLIENT_USER' });
      await expect(service.assign('incident-1', 'u-2', analyst)).rejects.toThrow(
        'User u-2 is not an analyst',
      );
      expect(incidentsRepository.update).not.toHaveBeenCalled();
    });

    it('assigns an analyst', async () => {
      usersRepository.findById.mockResolvedValue({ id: 'u-2', role: 'ANALYST' });
      await service.assign('incident-1', 'u-2', analyst);
      expect(incidentsRepository.update).toHaveBeenCalledWith('incident-1', {
        assignedUserId: 'u-2',
      });
      expect(recorder.recordAssigneeUpdated).toHaveBeenCalledWith('incident-1', analyst.sub, 'u-2');
    });

    it('fails for a missing incident', async () => {
      incidentsRepository.findById.mockResolvedValue(null);
      await expect(service.assign('missing', 'u-2', analyst)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addComment', () => {
    beforeEach(() => incidentsRepository.findById.mockResolvedValue(makeIncident()));

    it('rejects a blank comment', async () => {
      await expect(service.addComment('incident-1', '  ', analyst)).rejects.toThrow(
        'Comment body is required',
      );
    });

    it('records the trimmed comment', async () => {
      const activity = { id: 'act-1' };
      recorder.recordCommentAdded.mockResolvedValue(activity);
      await expect(service.addComment('incident-1', ' Looking into it ', analyst)).resolves.toBe(
        activity,
      );
      expect(recorder.recordCommentAdded).toHaveBeenCalledWith(
        'incident-1',
        analyst.sub,
        'Looking into it',
      );
    });
  });

  describe('remove', () => {
    it('deletes an existing incident', async () => {
      incidentsRepository.findById.mockResolvedValue(makeIncident());
      await service.remove('incident-1');
      expect(incidentsRepository.delete).toHaveBeenCalledWith('incident-1');
    });

    it('does not delete a missing incident', async () => {
      incidentsRepository.findById.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
      expect(incidentsRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('createSystemIncident', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-03-15T12:00:00.000Z'));
    });
    afterEach(() => jest.useRealTimers());

    it('creates an API-sourced incident with defaults and no actor', async () => {
      const incident = makeIncident({ status: 'OPEN', severity: 'LOW' });
      incidentsRepository.create.mockResolvedValue(incident);

      await service.createSystemIncident({
        title: 'Unusual outbound traffic',
        severity: 'LOW',
        tenantId: TENANT.id,
        client: TENANT.name,
        sourceRef: 'siem-123',
        incidentType: 'OTHER',
      });

      expect(incidentsRepository.create).toHaveBeenCalledWith(
        {
          title: 'Unusual outbound traffic',
          description: undefined,
          severity: 'LOW',
          status: 'OPEN',
          client: TENANT.name,
          detectedAt: '2026-03-15T12:00:00.000Z',
        },
        { tenantId: TENANT.id, sourceType: 'API', sourceRef: 'siem-123', incidentType: 'OTHER' },
      );
      expect(recorder.recordIncidentOpened).toHaveBeenCalledWith(
        incident.id,
        undefined,
        'LOW',
        'OPEN',
      );
    });

    it('keeps an explicit status', async () => {
      incidentsRepository.create.mockResolvedValue(makeIncident());
      await service.createSystemIncident({
        title: 't',
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        tenantId: TENANT.id,
        client: TENANT.name,
        incidentType: 'MALWARE',
      });
      expect(incidentsRepository.create.mock.calls[0][0].status).toBe('IN_PROGRESS');
    });
  });
});
