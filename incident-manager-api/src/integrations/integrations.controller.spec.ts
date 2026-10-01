import { IncidentIngestionService } from './incident-ingestion.service';
import { IntegrationsController } from './integrations.controller';

describe('IntegrationsController', () => {
  it('delegates ingestion to the service', () => {
    const service = { ingest: jest.fn().mockReturnValue('incident') };
    const controller = new IntegrationsController(service as unknown as IncidentIngestionService);
    const dto = { title: 't', severity: 'LOW' as const, tenantId: 'tenant-1' };

    expect(controller.ingest(dto)).toBe('incident');
    expect(service.ingest).toHaveBeenCalledWith(dto);
  });
});
