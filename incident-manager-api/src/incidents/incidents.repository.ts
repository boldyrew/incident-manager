import { Injectable } from '@nestjs/common';
import { IncidentSeverity, IncidentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { Incident } from './entities/incident.entity';
import { tenantSelect } from 'src/prisma/selections';

export interface FindAllIncidentFilters {
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  search?: string;
  tenantId?: string;
}

export const incidentBaseSelect = {
  id: true,
  code: true,
  title: true,
  status: true,
  severity: true,
  detectedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.IncidentSelect;

export const incidentSelect = {
  id: true,
  code: true,
  title: true,
  description: true,
  severity: true,
  status: true,
  client: true,
  tenant: { select: tenantSelect },
  detectedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.IncidentSelect;

export type IncidentBaseRecord = Prisma.IncidentGetPayload<{
  select: typeof incidentBaseSelect;
}>;

type IncidentRecord = Prisma.IncidentGetPayload<{
  select: typeof incidentSelect;
}>;

@Injectable()
export class IncidentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateIncidentDto, options?: { tenantId?: string }): Promise<Incident> {
    const code = await this.getNewIncidentCode();

    const incident = await this.prisma.incident.create({
      data: {
        ...dto,
        code,
        detectedAt: new Date(dto.detectedAt),
        ...(options?.tenantId != null ? { tenantId: options.tenantId } : {}),
      },
      select: incidentSelect,
    });

    return this.mapIncident(incident);
  }

  async findAll(
    filters: FindAllIncidentFilters = {},
    scopedTenantId?: string,
  ): Promise<Incident[]> {
    const { severity, status, search } = filters;

    const incidents = await this.prisma.incident.findMany({
      where: {
        ...(scopedTenantId ? { tenantId: scopedTenantId } : {}),
        ...(severity && { severity }),
        ...(status && { status }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { client: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { detectedAt: 'desc' },
      select: incidentSelect,
    });

    return incidents.map((incident) => this.mapIncident(incident));
  }

  async findById(id: string): Promise<Incident | null> {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      select: incidentSelect,
    });
    if (!incident) return null;
    return this.mapIncident(incident);
  }

  async update(id: string, dto: UpdateIncidentDto): Promise<Incident> {
    const incident = await this.prisma.incident.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.detectedAt && { detectedAt: new Date(dto.detectedAt) }),
      },
      select: incidentSelect,
    });

    return this.mapIncident(incident);
  }

  async delete(id: string): Promise<Incident> {
    const incident = await this.prisma.incident.delete({ where: { id }, select: incidentSelect });
    return this.mapIncident(incident);
  }

  private async getNewIncidentCode(): Promise<string> {
    const seq = await this.prisma.$queryRaw<
      { nextval: bigint }[]
    >`SELECT nextval('incident_code_seq')`;
    return `INC-${String(seq[0].nextval).padStart(4, '0')}`;
  }

  private mapIncident(incident: IncidentRecord): Incident {
    return {
      id: incident.id,
      code: incident.code,
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      detectedAt: incident.detectedAt,
      tenant: incident.tenant
        ? { id: incident.tenant.id, name: incident.tenant.name, alias: incident.tenant.alias }
        : null,
    };
  }
}
