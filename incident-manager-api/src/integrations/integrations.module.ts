import { Module } from '@nestjs/common';
import { IncidentsModule } from '../incidents/incidents.module';
import { ApiKeyGuard } from './guards/api-key.guard';
import { IncidentIngestionService } from './incident-ingestion.service';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [IncidentsModule],
  controllers: [IntegrationsController],
  providers: [IncidentIngestionService, ApiKeyGuard],
})
export class IntegrationsModule {}
