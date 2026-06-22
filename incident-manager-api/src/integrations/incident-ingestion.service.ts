import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { IncidentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IncidentsService } from '../incidents/incidents.service';
import { CreateExternalIncidentDto } from './dto/create-external-incident.dto';

@Injectable()
export class IncidentIngestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly incidentsService: IncidentsService,
  ) {}

  async ingest(dto: CreateExternalIncidentDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) {
      throw new BadRequestException(`Tenant ${dto.tenantId} not found`);
    }

    // if (dto.sourceRef) {
    //   const duplicate = await this.prisma.incident.findFirst({
    //     where: { sourceRef: dto.sourceRef, tenantId: dto.tenantId },
    //     select: { id: true },
    //   });
    //   if (duplicate) {
    //     throw new ConflictException(
    //       `Incident with sourceRef "${dto.sourceRef}" already exists for this tenant`,
    //     );
    //   }
    // }

    return this.incidentsService.createSystemIncident({
      title: dto.title,
      description: dto.description,
      severity: dto.severity,
      tenantId: dto.tenantId,
      client: tenant.name,
      sourceRef: dto.sourceRef,
      incidentType: dto.type ?? IncidentType.OTHER,
    });
  }
}
