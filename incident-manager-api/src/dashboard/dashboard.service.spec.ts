import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma.mock';
import { DashboardService } from './dashboard.service';

const NOW = new Date('2026-03-15T12:00:00.000Z'); // Sunday
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 60 * 60 * 1000);

function incidentRow(overrides: Record<string, unknown>) {
  return {
    severity: 'LOW',
    status: 'OPEN',
    detectedAt: NOW,
    resolvedAt: null,
    createdAt: NOW,
    ...overrides,
  };
}

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(NOW);
    prisma = createPrismaMock();
    prisma.incident.count.mockResolvedValue(0);
    prisma.incident.findMany.mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      providers: [DashboardService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(DashboardService);
  });

  afterEach(() => jest.useRealTimers());

  describe('getStats', () => {
    it('returns the counters from the count queries', async () => {
      prisma.incident.count
        .mockResolvedValueOnce(7)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(4);

      const stats = await service.getStats();

      expect(stats).toMatchObject({ openIncidents: 7, criticalIncidents: 2, resolvedThisWeek: 4 });
    });

    it('queries without a tenant filter by default', async () => {
      await service.getStats();

      const weekAgo = new Date('2026-03-08T12:00:00.000Z');
      expect(prisma.incident.count.mock.calls.map(([args]) => args)).toEqual([
        { where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } },
        { where: { severity: 'CRITICAL', status: { in: ['OPEN', 'IN_PROGRESS'] } } },
        { where: { status: { in: ['RESOLVED', 'CLOSED'] }, resolvedAt: { gte: weekAgo } } },
      ]);
      expect(prisma.incident.findMany.mock.calls[0][0].where).toEqual({});
    });

    it('applies the tenant filter to every query', async () => {
      await service.getStats('tenant-1');

      for (const [args] of prisma.incident.count.mock.calls) {
        expect(args.where.tenantId).toBe('tenant-1');
      }
      expect(prisma.incident.findMany.mock.calls[0][0].where).toEqual({ tenantId: 'tenant-1' });
    });

    it('counts SLA breaches per severity window', async () => {
      prisma.incident.findMany.mockResolvedValue([
        // open CRITICAL, 5h old > 4h SLA -> breach
        incidentRow({ severity: 'CRITICAL', detectedAt: hoursAgo(5) }),
        // in-progress HIGH, 7h old < 8h SLA -> ok
        incidentRow({ severity: 'HIGH', status: 'IN_PROGRESS', detectedAt: hoursAgo(7) }),
        // MEDIUM resolved after 20h < 24h SLA -> ok, even though it is far older than 24h now
        incidentRow({
          severity: 'MEDIUM',
          status: 'RESOLVED',
          detectedAt: hoursAgo(100),
          resolvedAt: hoursAgo(80),
        }),
        // LOW closed after 80h > 72h SLA -> breach
        incidentRow({
          severity: 'LOW',
          status: 'CLOSED',
          detectedAt: hoursAgo(200),
          resolvedAt: hoursAgo(120),
        }),
        // RESOLVED without resolvedAt falls back to age: 10h > 8h -> breach
        incidentRow({ severity: 'HIGH', status: 'RESOLVED', detectedAt: hoursAgo(10) }),
      ]);

      const stats = await service.getStats();

      expect(stats.slaBreaches).toBe(3);
      expect(stats.incidentsBySeverity).toEqual({ CRITICAL: 1, HIGH: 2, MEDIUM: 1, LOW: 1 });
    });

    it('buckets incidents created over the last 7 days', async () => {
      prisma.incident.findMany.mockResolvedValue(
        [
          '2026-03-08T23:59:59.000Z', // before the window
          '2026-03-09T00:00:00.000Z', // Monday, start boundary
          '2026-03-12T10:00:00.000Z', // Thursday
          '2026-03-15T01:00:00.000Z', // today
          '2026-03-15T11:00:00.000Z', // today
        ].map((createdAt) => incidentRow({ createdAt: new Date(createdAt) })),
      );

      const { incidentsOverTime } = await service.getStats();

      expect(incidentsOverTime).toEqual([
        { day: 'Mon', count: 1 },
        { day: 'Tue', count: 0 },
        { day: 'Wed', count: 0 },
        { day: 'Thu', count: 1 },
        { day: 'Fri', count: 0 },
        { day: 'Sat', count: 0 },
        { day: 'Sun', count: 2 },
      ]);
    });
  });

  describe('getRecentIncidents', () => {
    it('returns the latest 5 incidents by default', async () => {
      const recent = [{ id: 'inc-1' }];
      prisma.incident.findMany.mockResolvedValue(recent);

      await expect(service.getRecentIncidents()).resolves.toBe(recent);

      expect(prisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {}, orderBy: { detectedAt: 'desc' }, take: 5 }),
      );
    });

    it('applies the tenant filter and a custom limit', async () => {
      await service.getRecentIncidents('tenant-1', 10);
      expect(prisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' }, take: 10 }),
      );
    });
  });
});
