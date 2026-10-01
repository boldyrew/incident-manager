import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IncidentsService } from '../incidents/incidents.service';
import { PrismaService } from '../prisma/prisma.service';
import { makeIncident, TENANT } from '../test-utils/fixtures';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma.mock';
import { IncidentIngestionService } from './incident-ingestion.service';

describe('IncidentIngestionService', () => {
  let service: IncidentIngestionService;
  let prisma: PrismaMock;
  let incidentsService: { createSystemIncident: jest.Mock };

  const dto = {
    title: 'Phishing email campaign targeting finance department',
    description: 'Reported by mail gateway',
    severity: 'HIGH' as const,
    tenantId: TENANT.id,
    sourceRef: 'mailgw-42',
  };

  beforeEach(async () => {
    prisma = createPrismaMock();
    incidentsService = { createSystemIncident: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        IncidentIngestionService,
        { provide: PrismaService, useValue: prisma },
        { provide: IncidentsService, useValue: incidentsService },
      ],
    }).compile();
    service = moduleRef.get(IncidentIngestionService);
  });

  it('rejects an unknown tenant', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);
    await expect(service.ingest(dto)).rejects.toThrow(
      new BadRequestException(`Tenant ${TENANT.id} not found`),
    );
    expect(incidentsService.createSystemIncident).not.toHaveBeenCalled();
  });

  it('creates a system incident using the tenant name as client', async () => {
    const incident = makeIncident();
    prisma.tenant.findUnique.mockResolvedValue(TENANT);
    incidentsService.createSystemIncident.mockResolvedValue(incident);

    await expect(service.ingest(dto)).resolves.toBe(incident);

    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({ where: { id: TENANT.id } });
    expect(incidentsService.createSystemIncident).toHaveBeenCalledWith({
      title: dto.title,
      description: dto.description,
      severity: 'HIGH',
      status: undefined,
      tenantId: TENANT.id,
      client: TENANT.name,
      sourceRef: 'mailgw-42',
      incidentType: 'OTHER',
    });
  });

  it('passes an explicit incident type and status through', async () => {
    prisma.tenant.findUnique.mockResolvedValue(TENANT);
    await service.ingest({ ...dto, type: 'PHISHING', status: 'IN_PROGRESS' });
    expect(incidentsService.createSystemIncident).toHaveBeenCalledWith(
      expect.objectContaining({ incidentType: 'PHISHING', status: 'IN_PROGRESS' }),
    );
  });
});
