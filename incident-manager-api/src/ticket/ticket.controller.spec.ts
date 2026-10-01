import { makeUser } from '../test-utils/fixtures';
import { rolesOf } from '../test-utils/roles';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

describe('TicketController', () => {
  let controller: TicketController;
  let service: Record<string, jest.Mock>;
  const analyst = makeUser('ANALYST');

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue(['ticket']),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      assign: jest.fn(),
      linkIncident: jest.fn(),
      setStatus: jest.fn(),
      setPriority: jest.fn(),
      updateTitle: jest.fn(),
      updateDescription: jest.fn(),
      addComment: jest.fn(),
    };
    controller = new TicketController(service as unknown as TicketService);
  });

  it('delegates CRUD handlers', async () => {
    const dto = { title: 't', priority: 'LOW' as const, status: 'OPEN' as const };
    controller.create(dto, analyst);
    await expect(controller.findAll(analyst)).resolves.toEqual(['ticket']);
    controller.findOne('t-1');
    controller.update('t-1', { title: 'x' });
    controller.remove('t-1');

    expect(service.create).toHaveBeenCalledWith(dto, analyst);
    expect(service.findAll).toHaveBeenCalledWith(analyst);
    expect(service.findOne).toHaveBeenCalledWith('t-1');
    expect(service.update).toHaveBeenCalledWith('t-1', { title: 'x' });
    expect(service.remove).toHaveBeenCalledWith('t-1');
  });

  it('unwraps DTO fields for the action handlers', () => {
    controller.assign('t-1', { userId: 'u-2' }, analyst);
    controller.linkIncident('t-1', { incidentId: 'inc-1' }, analyst);
    controller.setStatus('t-1', { status: 'CLOSED' }, analyst);
    controller.setPriority('t-1', { priority: 'HIGH' }, analyst);
    controller.updateTitle('t-1', { title: 'New' }, analyst);
    controller.updateDescription('t-1', { description: 'Desc' }, analyst);
    controller.addComment('t-1', { body: 'note' }, analyst);

    expect(service.assign).toHaveBeenCalledWith('t-1', 'u-2', analyst);
    expect(service.linkIncident).toHaveBeenCalledWith('t-1', 'inc-1', analyst);
    expect(service.setStatus).toHaveBeenCalledWith('t-1', 'CLOSED', analyst);
    expect(service.setPriority).toHaveBeenCalledWith('t-1', 'HIGH', analyst);
    expect(service.updateTitle).toHaveBeenCalledWith('t-1', 'New', analyst);
    expect(service.updateDescription).toHaveBeenCalledWith('t-1', 'Desc', analyst);
    expect(service.addComment).toHaveBeenCalledWith('t-1', 'note', analyst);
  });

  it.each([
    'create',
    'assign',
    'linkIncident',
    'setStatus',
    'setPriority',
    'updateTitle',
    'updateDescription',
  ])('%s is restricted to staff roles', (handler) => {
    expect(rolesOf(TicketController, handler)).toEqual(['ADMIN', 'ANALYST']);
  });
});
