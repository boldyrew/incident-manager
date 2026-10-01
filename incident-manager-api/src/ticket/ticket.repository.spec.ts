import { NotFoundException } from '@nestjs/common';
import { asPrismaService, createPrismaMock, PrismaMock } from '../test-utils/prisma.mock';
import { TicketRepository } from './ticket.repository';

function makeRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ticket-1',
    code: 'TKT-0001',
    title: 'Reset credentials',
    description: 'Rotate passwords',
    priority: 'HIGH',
    status: 'OPEN',
    incidentId: 'incident-1',
    createdAt: new Date('2026-01-01T10:00:00Z'),
    updatedAt: new Date('2026-01-02T10:00:00Z'),
    tenant: { id: 'tenant-1', name: 'Acme Corp', alias: 'acme' },
    assignee: { id: 'u-1', fullName: 'Jane Analyst', email: 'jane@secureops.io' },
    incident: {
      id: 'incident-1',
      code: 'INC-0001',
      title: 'Suspicious login',
      status: 'OPEN',
      severity: 'HIGH',
      detectedAt: new Date('2026-01-01T09:00:00Z'),
      resolvedAt: undefined,
    },
    ...overrides,
  };
}

describe('TicketRepository', () => {
  let prisma: PrismaMock;
  let repository: TicketRepository;

  const dto = { title: 'Reset credentials', priority: 'HIGH' as const, status: 'OPEN' as const };

  beforeEach(() => {
    prisma = createPrismaMock();
    repository = new TicketRepository(asPrismaService(prisma));
    prisma.$queryRaw.mockResolvedValue([{ nextval: BigInt(7) }]);
    prisma.ticket.create.mockResolvedValue(makeRecord());
  });

  describe('create', () => {
    it('rejects an unknown tenant', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);
      await expect(repository.create({ ...dto, tenantId: 'missing' })).rejects.toThrow(
        new NotFoundException('Tenant missing not found'),
      );
      expect(prisma.ticket.create).not.toHaveBeenCalled();
    });

    it('prefers the scoped tenant over dto.tenantId', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 'scoped' });
      await repository.create({ ...dto, tenantId: 'other' }, 'scoped');
      expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: 'scoped' },
        select: { id: true },
      });
      expect(prisma.ticket.create.mock.calls[0][0].data.tenantId).toBe('scoped');
    });

    it('rejects a linked incident outside the tenant', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1' });
      prisma.incident.findFirst.mockResolvedValue(null);

      await expect(
        repository.create({ ...dto, tenantId: 'tenant-1', incidentId: 'incident-9' }),
      ).rejects.toThrow('Incident incident-9 not found');
      expect(prisma.incident.findFirst).toHaveBeenCalledWith({
        where: { id: 'incident-9', tenantId: 'tenant-1' },
        select: { id: true },
      });
    });

    it('does not scope the incident lookup when there is no tenant', async () => {
      prisma.incident.findFirst.mockResolvedValue({ id: 'incident-1' });
      await repository.create({ ...dto, incidentId: 'incident-1' });
      expect(prisma.tenant.findUnique).not.toHaveBeenCalled();
      expect(prisma.incident.findFirst.mock.calls[0][0].where).toEqual({ id: 'incident-1' });
    });

    it('creates the ticket with a generated code', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1' });

      await repository.create({ ...dto, tenantId: 'tenant-1', description: 'd' });

      expect(prisma.ticket.create.mock.calls[0][0].data).toEqual({
        code: 'TKT-0007',
        title: dto.title,
        description: 'd',
        priority: 'HIGH',
        status: 'OPEN',
        incidentId: null,
        tenantId: 'tenant-1',
      });
    });

    it('maps the created ticket', async () => {
      const ticket = await repository.create(dto);
      expect(ticket).toEqual({
        id: 'ticket-1',
        code: 'TKT-0001',
        title: 'Reset credentials',
        priority: 'HIGH',
        status: 'OPEN',
        incidentId: 'incident-1',
        assignedUser: { id: 'u-1', fullName: 'Jane Analyst', email: 'jane@secureops.io' },
        incident: {
          id: 'incident-1',
          code: 'INC-0001',
          title: 'Suspicious login',
          status: 'OPEN',
          severity: 'HIGH',
          detectedAt: new Date('2026-01-01T09:00:00Z'),
          resolvedAt: null,
        },
        tenant: { id: 'tenant-1', name: 'Acme Corp', alias: 'acme' },
        createdAt: new Date('2026-01-01T10:00:00Z'),
        updatedAt: new Date('2026-01-02T10:00:00Z'),
      });
      expect(ticket).not.toHaveProperty('description');
    });
  });

  describe('findAll', () => {
    it('scopes by tenant when given', async () => {
      prisma.ticket.findMany.mockResolvedValue([makeRecord()]);
      await repository.findAll('tenant-1');
      expect(prisma.ticket.findMany.mock.calls[0][0]).toMatchObject({
        where: { tenantId: 'tenant-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('maps null relations', async () => {
      prisma.ticket.findMany.mockResolvedValue([
        makeRecord({ assignee: null, incident: null, tenant: null }),
      ]);
      const [ticket] = await repository.findAll();
      expect(prisma.ticket.findMany.mock.calls[0][0].where).toEqual({});
      expect(ticket.assignedUser).toBeNull();
      expect(ticket.incident).toBeNull();
      expect(ticket.tenant).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns null when missing', async () => {
      prisma.ticket.findFirst.mockResolvedValue(null);
      await expect(repository.findById('missing')).resolves.toBeNull();
    });

    it('includes the description', async () => {
      prisma.ticket.findFirst.mockResolvedValue(makeRecord());
      const ticket = await repository.findById('ticket-1');
      expect(ticket.description).toBe('Rotate passwords');
    });
  });

  it('update passes the dto as data', async () => {
    prisma.ticket.update.mockResolvedValue(makeRecord());
    await repository.update('ticket-1', { status: 'CLOSED' });
    expect(prisma.ticket.update.mock.calls[0][0]).toMatchObject({
      where: { id: 'ticket-1' },
      data: { status: 'CLOSED' },
    });
  });

  it('delete removes the ticket', async () => {
    prisma.ticket.delete.mockResolvedValue(makeRecord());
    const ticket = await repository.delete('ticket-1');
    expect(prisma.ticket.delete.mock.calls[0][0].where).toEqual({ id: 'ticket-1' });
    expect(ticket.id).toBe('ticket-1');
  });
});
