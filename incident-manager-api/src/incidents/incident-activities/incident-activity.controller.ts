import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IncidentActivityService } from './incident-activity/incident-activity.service';

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentActivityController {
  constructor(private readonly incidentActivityService: IncidentActivityService) {}

  @Get(':id/activities')
  findByIncidentId(@Param('id') id: string) {
    return this.incidentActivityService.findByIncidentId(id);
  }
}
