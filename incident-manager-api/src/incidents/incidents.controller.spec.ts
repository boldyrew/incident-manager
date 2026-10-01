import { BadRequestException } from '@nestjs/common';
import { makeUser } from '../test-utils/fixtures';
import { rolesOf } from '../test-utils/roles';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';

describe('IncidentsController', () => {
  let controller: IncidentsController;
  let service: Record<string, jest.Mock>;
  const analyst = makeUser('ANALYST');

  beforeEach(() => {
    service = {
      create: jest.fn().mockReturnValue('created'),
      findAll: jest.fn().mockReturnValue('list'),
      findOne: jest.fn().mockReturnValue('one'),
      update: jest.fn().mockReturnValue('updated'),
      assign: jest.fn(),
      setStatus: jest.fn(),
      setSeverity: jest.fn(),
      updateTitle: jest.fn(),
      updateDescription: jest.fn(),
      addComment: jest.fn(),
      remove: jest.fn(),
    };
    controller = new IncidentsController(service as unknown as IncidentsService);
  });

  describe('findAll', () => {
    it('forwards filters for staff', () => {
      expect(controller.findAll(analyst, 'HIGH', 'OPEN', 'phish', 'tenant-1')).toBe('list');
      expect(service.findAll).toHaveBeenCalledWith(
        { severity: 'HIGH', status: 'OPEN', search: 'phish', tenantId: 'tenant-1' },
        analyst,
      );
    });

    it('rejects a tenantId query from a client user', () => {
      expect(() =>
        controller.findAll(makeUser('CLIENT_USER'), undefined, undefined, undefined, 'tenant-2'),
      ).toThrow(new BadRequestException('Tenant ID is not allowed'));
      expect(service.findAll).not.toHaveBeenCalled();
    });

    it('allows a client user without a tenantId query', () => {
      const client = makeUser('CLIENT_USER');
      controller.findAll(client);
      expect(service.findAll).toHaveBeenCalledWith(
        { severity: undefined, status: undefined, search: undefined, tenantId: undefined },
        client,
      );
    });
  });

  it('delegates CRUD handlers', () => {
    const dto = {
      title: 't',
      severity: 'LOW' as const,
      status: 'OPEN' as const,
      client: 'c',
      detectedAt: '2026-01-01T00:00:00Z',
    };
    expect(controller.create(dto, analyst)).toBe('created');
    expect(controller.findOne('id-1')).toBe('one');
    expect(controller.update('id-1', { title: 'x' })).toBe('updated');
    controller.remove('id-1');

    expect(service.create).toHaveBeenCalledWith(dto, analyst);
    expect(service.findOne).toHaveBeenCalledWith('id-1');
    expect(service.update).toHaveBeenCalledWith('id-1', { title: 'x' });
    expect(service.remove).toHaveBeenCalledWith('id-1');
  });

  it('unwraps DTO fields for the action handlers', () => {
    controller.assign('id-1', { userId: 'u-2' }, analyst);
    controller.setStatus('id-1', { status: 'RESOLVED' }, analyst);
    controller.setSeverity('id-1', { severity: 'CRITICAL' }, analyst);
    controller.updateTitle('id-1', { title: 'New' }, analyst);
    controller.updateDescription('id-1', { description: 'Desc' }, analyst);
    controller.addComment('id-1', { body: 'note' }, analyst);

    expect(service.assign).toHaveBeenCalledWith('id-1', 'u-2', analyst);
    expect(service.setStatus).toHaveBeenCalledWith('id-1', 'RESOLVED', analyst);
    expect(service.setSeverity).toHaveBeenCalledWith('id-1', 'CRITICAL', analyst);
    expect(service.updateTitle).toHaveBeenCalledWith('id-1', 'New', analyst);
    expect(service.updateDescription).toHaveBeenCalledWith('id-1', 'Desc', analyst);
    expect(service.addComment).toHaveBeenCalledWith('id-1', 'note', analyst);
  });

  it.each(['assign', 'setStatus', 'setSeverity', 'updateTitle', 'updateDescription'])(
    '%s is restricted to staff roles',
    (handler) => {
      expect(rolesOf(IncidentsController, handler)).toEqual(['ADMIN', 'ANALYST']);
    },
  );
});
