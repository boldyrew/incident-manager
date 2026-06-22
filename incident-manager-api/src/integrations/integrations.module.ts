import { Module } from '@nestjs/common';
import { IncidentsModule } from '../incidents/incidents.module';
import { PrismaService } from '../prisma/prisma.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { IncidentIngestionService } from './incident-ingestion.service';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [IncidentsModule],
  controllers: [IntegrationsController],
  providers: [IncidentIngestionService, ApiKeyGuard, PrismaService],
})
export class IntegrationsModule {}
