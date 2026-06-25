import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from './guards/api-key.guard';
import { IncidentIngestionService } from './incident-ingestion.service';
import { CreateExternalIncidentDto } from './dto/create-external-incident.dto';

@Controller('integrations')
@UseGuards(ApiKeyGuard)
export class IntegrationsController {
  constructor(private readonly incidentIngestionService: IncidentIngestionService) {}

  @Post('incidents')
  @HttpCode(201)
  ingest(@Body() dto: CreateExternalIncidentDto) {
    return this.incidentIngestionService.ingest(dto);
  }
}
