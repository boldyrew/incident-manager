import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TenantsRepository } from './tenants.repository';
import { TenantsService } from './tenants.service';

describe('TenantsService', () => {
  let service: TenantsService;
  let repository: Record<
    'create' | 'findAll' | 'findById' | 'update' | 'delete' | 'getGlobalStats',
    jest.Mock
  >;
  const tenant = { id: 'tenant-1', name: 'Acme Corp', alias: 'acme' };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getGlobalStats: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [TenantsService, { provide: TenantsRepository, useValue: repository }],
    }).compile();
    service = moduleRef.get(TenantsService);
  });

  it('creates a tenant', async () => {
    const dto = { name: 'Acme Corp', alias: 'acme' };
    repository.create.mockResolvedValue(tenant);
    await expect(service.create(dto)).resolves.toBe(tenant);
    expect(repository.create).toHaveBeenCalledWith(dto);
  });

  it('lists tenants and global stats', async () => {
    repository.findAll.mockResolvedValue([tenant]);
    repository.getGlobalStats.mockResolvedValue({ totalClients: 1 });
    await expect(service.findAll()).resolves.toEqual([tenant]);
    await expect(service.getGlobalStats()).resolves.toEqual({ totalClients: 1 });
  });

  it('finds a tenant', async () => {
    repository.findById.mockResolvedValue(tenant);
    await expect(service.findOne('tenant-1')).resolves.toBe(tenant);
  });

  describe('when the tenant does not exist', () => {
    beforeEach(() => repository.findById.mockResolvedValue(null));

    it('findOne throws NotFound', async () => {
      await expect(service.findOne('missing')).rejects.toThrow(
        new NotFoundException('Tenant missing not found'),
      );
    });

    it('update does not write', async () => {
      await expect(service.update('missing', { name: 'x' })).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('remove does not delete', async () => {
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  it('updates and removes an existing tenant', async () => {
    repository.findById.mockResolvedValue(tenant);
    await service.update('tenant-1', { name: 'Acme Inc' });
    await service.remove('tenant-1');
    expect(repository.update).toHaveBeenCalledWith('tenant-1', { name: 'Acme Inc' });
    expect(repository.delete).toHaveBeenCalledWith('tenant-1');
  });
});
