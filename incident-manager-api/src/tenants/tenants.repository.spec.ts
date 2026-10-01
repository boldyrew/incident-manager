import { asPrismaService, createPrismaMock, PrismaMock } from '../test-utils/prisma.mock';
import { TenantsRepository } from './tenants.repository';

const NOW = new Date('2026-03-15T12:00:00.000Z');
const MONTH_START = new Date('2026-03-01T00:00:00.000Z');

describe('TenantsRepository', () => {
  let prisma: PrismaMock;
  let repository: TenantsRepository;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
    prisma = createPrismaMock();
    repository = new TenantsRepository(asPrismaService(prisma));
  });

  afterEach(() => jest.useRealTimers());

  it('delegates CRUD operations to Prisma', async () => {
    const dto = { name: 'Acme Corp', alias: 'acme' };
    await repository.create(dto);
    await repository.findById('tenant-1');
    await repository.update('tenant-1', { name: 'Acme Inc' });
    await repository.delete('tenant-1');

    expect(prisma.tenant.create).toHaveBeenCalledWith({ data: dto });
    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({ where: { id: 'tenant-1' } });
    expect(prisma.tenant.update).toHaveBeenCalledWith({
      where: { id: 'tenant-1' },
      data: { name: 'Acme Inc' },
    });
    expect(prisma.tenant.delete).toHaveBeenCalledWith({ where: { id: 'tenant-1' } });
  });

  describe('findAll', () => {
    it('aggregates incident counters per tenant', async () => {
      const tenant = {
        id: 'tenant-1',
        name: 'Acme Corp',
        alias: 'acme',
        industry: 'Finance',
        tier: 'ENTERPRISE',
        status: 'ACTIVE',
        createdAt: NOW,
        updatedAt: NOW,
        incidents: [
          { status: 'OPEN', severity: 'CRITICAL', resolvedAt: null },
          { status: 'IN_PROGRESS', severity: 'HIGH', resolvedAt: null },
          { status: 'RESOLVED', severity: 'CRITICAL', resolvedAt: new Date('2026-03-10T00:00:00Z') },
          { status: 'CLOSED', severity: 'LOW', resolvedAt: MONTH_START },
          { status: 'CLOSED', severity: 'LOW', resolvedAt: new Date('2026-02-28T23:59:59Z') },
          { status: 'RESOLVED', severity: 'LOW', resolvedAt: null },
        ],
      };
      prisma.tenant.findMany.mockResolvedValue([tenant]);

      const [result] = await repository.findAll();

      expect(prisma.tenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: 'asc' } }),
      );
      expect(result).toEqual({
        id: 'tenant-1',
        name: 'Acme Corp',
        alias: 'acme',
        industry: 'Finance',
        tier: 'ENTERPRISE',
        status: 'ACTIVE',
        createdAt: NOW,
        updatedAt: NOW,
        openIncidents: 2,
        criticalIncidents: 1,
        resolvedThisMonth: 2,
      });
      expect(result).not.toHaveProperty('incidents');
    });
  });

  describe('getGlobalStats', () => {
    it('returns the four counters', async () => {
      prisma.tenant.count.mockResolvedValue(3);
      prisma.incident.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(5);

      await expect(repository.getGlobalStats()).resolves.toEqual({
        totalClients: 3,
        openIncidents: 10,
        criticalIncidents: 2,
        resolvedThisMonth: 5,
      });
      expect(prisma.incident.count.mock.calls[2][0]).toEqual({
        where: { status: { in: ['RESOLVED', 'CLOSED'] }, resolvedAt: { gte: MONTH_START } },
      });
    });
  });
});
