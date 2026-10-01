import { rolesOf } from '../test-utils/roles';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

describe('TenantsController', () => {
  let controller: TenantsController;
  let service: Record<string, jest.Mock>;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      getGlobalStats: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new TenantsController(service as unknown as TenantsService);
  });

  it('delegates every handler to the service', () => {
    const dto = { name: 'Acme Corp', alias: 'acme' };
    controller.findAll();
    controller.getGlobalStats();
    controller.findOne('tenant-1');
    controller.create(dto);
    controller.update('tenant-1', { name: 'Acme Inc' });
    controller.remove('tenant-1');

    expect(service.findAll).toHaveBeenCalled();
    expect(service.getGlobalStats).toHaveBeenCalled();
    expect(service.findOne).toHaveBeenCalledWith('tenant-1');
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(service.update).toHaveBeenCalledWith('tenant-1', { name: 'Acme Inc' });
    expect(service.remove).toHaveBeenCalledWith('tenant-1');
  });

  it.each(['findAll', 'getGlobalStats', 'findOne'])('%s is readable by staff', (handler) => {
    expect(rolesOf(TenantsController, handler)).toEqual(['ADMIN', 'ANALYST']);
  });

  it.each(['create', 'update', 'remove'])('%s is admin-only', (handler) => {
    expect(rolesOf(TenantsController, handler)).toEqual(['ADMIN']);
  });
});
