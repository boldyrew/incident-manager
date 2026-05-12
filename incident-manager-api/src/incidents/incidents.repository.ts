import { Injectable } from '@nestjs/common';
import {
  Incident as PrismaIncident,
  IncidentSeverity,
  IncidentStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { Incident } from './entities/incident.entity';

export interface FindAllIncidentFilters {
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  search?: string;
}

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
    });

    return incidents.map((incident) => this.mapIncident(incident));
  }

  async findById(id: string, scopedTenantId?: string): Promise<Incident | null> {
    const incident = await this.prisma.incident.findFirst({
      where: {
        id,
        ...(scopedTenantId ? { tenantId: scopedTenantId } : {}),
      },
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
    });

    return this.mapIncident(incident);
  }

  async delete(id: string): Promise<Incident> {
    const incident = await this.prisma.incident.delete({ where: { id } });
    return this.mapIncident(incident);
  }

  private async getNewIncidentCode(): Promise<string> {
    const seq = await this.prisma.$queryRaw<{ nextval: bigint }[]>`SELECT nextval('incident_code_seq')`;
    return `INC-${String(seq[0].nextval).padStart(4, '0')}`;
  }

  private mapIncident(incident: PrismaIncident): Incident {
    return {
      id: incident.id,
      code: incident.code,
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      client: incident.client,
      // assignedTo: incident.assignedTo,
      detectedAt: incident.detectedAt,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
    };
  }
}
