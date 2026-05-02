import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';

interface FindAllFilters {
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  search?: string;
}

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateIncidentDto) {
    const count = await this.prisma.incident.count();
    const incidentId = `INC-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.incident.create({
      data: {
        ...dto,
        incidentId,
        detectedAt: new Date(dto.detectedAt),
      },
    });
  }

  async findAll(filters: FindAllFilters = {}) {
    const { severity, status, search } = filters;

    return this.prisma.incident.findMany({
      where: {
        ...(severity && { severity }),
        ...(status && { status }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { client: { contains: search, mode: 'insensitive' } },
            { incidentId: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { detectedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new NotFoundException(`Incident ${id} not found`);
    return incident;
  }

  async update(id: string, dto: UpdateIncidentDto) {
    await this.findOne(id);
    return this.prisma.incident.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.detectedAt && { detectedAt: new Date(dto.detectedAt) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.incident.delete({ where: { id } });
  }
}
