import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SLA_HOURS: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 8,
  MEDIUM: 24,
  LOW: 72,
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(tenantId?: string) {
    const tenantFilter = tenantId ? { tenantId } : {};
    const now = new Date();

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [openCount, criticalCount, resolvedThisWeek, allIncidents] = await Promise.all([
      this.prisma.incident.count({
        where: { ...tenantFilter, status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
      this.prisma.incident.count({
        where: { ...tenantFilter, severity: 'CRITICAL', status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
      this.prisma.incident.count({
        where: {
          ...tenantFilter,
          status: { in: ['RESOLVED', 'CLOSED'] },
          resolvedAt: { gte: weekAgo },
        },
      }),
      this.prisma.incident.findMany({
        where: tenantFilter,
        select: {
          severity: true,
          status: true,
          detectedAt: true,
          resolvedAt: true,
          createdAt: true,
        },
      }),
    ]);

    const slaBreaches = allIncidents.filter((inc) => {
      const slaMsLimit = SLA_HOURS[inc.severity] * 60 * 60 * 1000;
      const resolvedStatuses = new Set(['RESOLVED', 'CLOSED']);
      if (resolvedStatuses.has(inc.status) && inc.resolvedAt) {
        return inc.resolvedAt.getTime() - inc.detectedAt.getTime() > slaMsLimit;
      }
      return now.getTime() - inc.detectedAt.getTime() > slaMsLimit;
    }).length;

    const incidentsBySeverity = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const inc of allIncidents) {
      incidentsBySeverity[inc.severity as keyof typeof incidentsBySeverity]++;
    }

    const incidentsOverTime = this.buildLast7Days(allIncidents.map((i) => i.createdAt));

    return {
      openIncidents: openCount,
      criticalIncidents: criticalCount,
      resolvedThisWeek,
      slaBreaches,
      incidentsBySeverity,
      incidentsOverTime,
    };
  }

  private buildLast7Days(dates: Date[]): { day: string; count: number }[] {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result: { day: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = dates.filter((dt) => dt >= dayStart && dt < dayEnd).length;
      result.push({ day: dayNames[d.getDay()], count });
    }

    return result;
  }

  async getRecentIncidents(tenantId?: string, limit = 5) {
    const tenantFilter = tenantId ? { tenantId } : {};
    return this.prisma.incident.findMany({
      where: tenantFilter,
      orderBy: { detectedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        code: true,
        title: true,
        severity: true,
        status: true,
        client: true,
        detectedAt: true,
        tenant: { select: { id: true, name: true, alias: true } },
      },
    });
  }
}
