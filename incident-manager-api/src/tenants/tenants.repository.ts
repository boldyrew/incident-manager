import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    return this.prisma.tenant.create({ data: dto });
  }

  async findAll() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const tenants = await this.prisma.tenant.findMany({
      orderBy: { name: 'asc' },
      include: {
        incidents: {
          select: { status: true, severity: true, resolvedAt: true },
        },
      },
    });

    return tenants.map((t) => {
      const openIncidents = t.incidents.filter((i) =>
        ['OPEN', 'IN_PROGRESS'].includes(i.status),
      ).length;
      const criticalIncidents = t.incidents.filter(
        (i) => i.severity === 'CRITICAL' && ['OPEN', 'IN_PROGRESS'].includes(i.status),
      ).length;
      const resolvedThisMonth = t.incidents.filter(
        (i) =>
          ['RESOLVED', 'CLOSED'].includes(i.status) &&
          i.resolvedAt != null &&
          i.resolvedAt >= monthStart,
      ).length;

      return {
        id: t.id,
        name: t.name,
        alias: t.alias,
        industry: t.industry,
        tier: t.tier,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        openIncidents,
        criticalIncidents,
        resolvedThisMonth,
      };
    });
  }

  async findById(id: string) {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateTenantDto) {
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    return this.prisma.tenant.delete({ where: { id } });
  }

  async getGlobalStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalClients, openIncidents, criticalIncidents, resolvedThisMonth] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.incident.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      this.prisma.incident.count({
        where: { severity: 'CRITICAL', status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
      this.prisma.incident.count({
        where: {
          status: { in: ['RESOLVED', 'CLOSED'] },
          resolvedAt: { gte: monthStart },
        },
      }),
    ]);

    return { totalClients, openIncidents, criticalIncidents, resolvedThisMonth };
  }
}
