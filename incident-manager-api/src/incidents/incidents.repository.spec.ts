import { asPrismaService, createPrismaMock, PrismaMock } from '../test-utils/prisma.mock';
import { IncidentsRepository, incidentSelect } from './incidents.repository';

function makeRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'incident-1',
    code: 'INC-0001',
    title: 'Privilege escalation detected',
    description: null,
    severity: 'CRITICAL',
    status: 'OPEN',
    client: 'Acme Corp',
    type: 'UNAUTHORIZED_ACCESS',
    sourceType: 'MANUAL',
    sourceRef: null,
    assignee: { id: 'u-1', fullName: 'Jane Analyst', email: 'jane@secureops.io' },
    tenant: { id: 'tenant-1', name: 'Acme Corp', alias: 'acme' },
    detectedAt: new Date('2026-01-01T10:00:00Z'),
    resolvedAt: null,
    createdAt: new Date('2026-01-01T10:00:00Z'),
    updatedAt: new Date('2026-01-01T10:00:00Z'),
    ...overrides,
  };
}

describe('IncidentsRepository', () => {
  let prisma: PrismaMock;
  let repository: IncidentsRepository;

  const createDto = {
    title: 'Privilege escalation detected',
    severity: 'CRITICAL' as const,
    status: 'OPEN' as const,
    client: 'Acme Corp',
    detectedAt: '2026-01-01T10:00:00.000Z',
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    repository = new IncidentsRepository(asPrismaService(prisma));
  });

  describe('create', () => {
    beforeEach(() => {
      prisma.$queryRaw.mockResolvedValue([{ nextval: BigInt(42) }]);
      prisma.incident.create.mockResolvedValue(makeRecord());
    });

    it('generates a zero-padded code from the sequence', async () => {
      await repository.create(createDto);
      expect(prisma.incident.create.mock.calls[0][0].data.code).toBe('INC-0042');
    });

    it('does not truncate codes beyond four digits', async () => {
      prisma.$queryRaw.mockResolvedValue([{ nextval: BigInt(123456) }]);
      await repository.create(createDto);
      expect(prisma.incident.create.mock.calls[0][0].data.code).toBe('INC-123456');
    });

    it('converts detectedAt and omits unset options', async () => {
      await repository.create(createDto);
      expect(prisma.incident.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          code: 'INC-0042',
          detectedAt: new Date(createDto.detectedAt),
        },
        select: incidentSelect,
      });
    });

    it('includes provided options', async () => {
      await repository.create(createDto, {
        tenantId: 'tenant-1',
        sourceType: 'API',
        sourceRef: 'siem-1',
        incidentType: 'MALWARE',
      });
      expect(prisma.incident.create.mock.calls[0][0].data).toMatchObject({
        tenantId: 'tenant-1',
        sourceType: 'API',
        sourceRef: 'siem-1',
        type: 'MALWARE',
      });
    });

    it('maps the created record', async () => {
      await expect(repository.create(createDto)).resolves.toEqual({
        id: 'incident-1',
        code: 'INC-0001',
        title: 'Privilege escalation detected',
        description: null,
        client: 'Acme Corp',
        type: 'UNAUTHORIZED_ACCESS',
        sourceType: 'MANUAL',
        sourceRef: null,
        severity: 'CRITICAL',
        status: 'OPEN',
        assignedUser: { id: 'u-1', fullName: 'Jane Analyst', email: 'jane@secureops.io' },
        detectedAt: new Date('2026-01-01T10:00:00Z'),
        resolvedAt: null,
        tenant: { id: 'tenant-1', name: 'Acme Corp', alias: 'acme' },
      });
    });
  });

  describe('findAll', () => {
    beforeEach(() => prisma.incident.findMany.mockResolvedValue([]));

    it('uses an empty where clause without filters', async () => {
      await repository.findAll();
      expect(prisma.incident.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { detectedAt: 'desc' },
        select: incidentSelect,
      });
    });

    it('combines tenant scope, severity, status and search', async () => {
      await repository.findAll(
        { severity: 'HIGH', status: 'OPEN', search: 'phish', tenantId: 'ignored' },
        'tenant-1',
      );
      expect(prisma.incident.findMany.mock.calls[0][0].where).toEqual({
        tenantId: 'tenant-1',
        severity: 'HIGH',
        status: 'OPEN',
        OR: [
          { title: { contains: 'phish', mode: 'insensitive' } },
          { client: { contains: 'phish', mode: 'insensitive' } },
          { code: { contains: 'phish', mode: 'insensitive' } },
        ],
      });
    });

    it('maps null assignee and tenant', async () => {
      prisma.incident.findMany.mockResolvedValue([makeRecord({ assignee: null, tenant: null })]);
      const [incident] = await repository.findAll();
      expect(incident.assignedUser).toBeNull();
      expect(incident.tenant).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns null when not found', async () => {
      prisma.incident.findUnique.mockResolvedValue(null);
      await expect(repository.findById('missing')).resolves.toBeNull();
    });

    it('returns the mapped incident', async () => {
      prisma.incident.findUnique.mockResolvedValue(makeRecord());
      const incident = await repository.findById('incident-1');
      expect(prisma.incident.findUnique).toHaveBeenCalledWith({
        where: { id: 'incident-1' },
        select: incidentSelect,
      });
      expect(incident.code).toBe('INC-0001');
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-03-15T12:00:00.000Z'));
      prisma.incident.update.mockResolvedValue(makeRecord());
    });
    afterEach(() => jest.useRealTimers());

    // NOTE: resolvedAt is overwritten on every RESOLVED/CLOSED write (e.g. RESOLVED -> CLOSED),
    // which shifts the original resolution time used by SLA stats.
    it.each(['RESOLVED', 'CLOSED'] as const)('stamps resolvedAt when status becomes %s', async (status) => {
      await repository.update('incident-1', { status });
      expect(prisma.incident.update.mock.calls[0][0].data).toEqual({
        status,
        resolvedAt: new Date('2026-03-15T12:00:00.000Z'),
      });
    });

    it.each(['OPEN', 'IN_PROGRESS'] as const)('does not touch resolvedAt for %s', async (status) => {
      await repository.update('incident-1', { status });
      expect(prisma.incident.update.mock.calls[0][0].data).toEqual({ status });
    });

    it('converts detectedAt and passes other fields through', async () => {
      await repository.update('incident-1', {
        title: 'New',
        detectedAt: '2026-02-01T00:00:00.000Z',
        assignedUserId: null,
      });
      expect(prisma.incident.update).toHaveBeenCalledWith({
        where: { id: 'incident-1' },
        data: {
          title: 'New',
          detectedAt: new Date('2026-02-01T00:00:00.000Z'),
          assignedUserId: null,
        },
        select: incidentSelect,
      });
    });
  });

  it('delete removes the incident and maps it', async () => {
    prisma.incident.delete.mockResolvedValue(makeRecord());
    const incident = await repository.delete('incident-1');
    expect(prisma.incident.delete).toHaveBeenCalledWith({
      where: { id: 'incident-1' },
      select: incidentSelect,
    });
    expect(incident.id).toBe('incident-1');
  });
});
