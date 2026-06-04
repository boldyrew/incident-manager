import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TicketActivityService } from './ticket-activity/ticket-activity.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketActivityController {
  constructor(private readonly ticketActivityService: TicketActivityService) {}

  @Get(':id/activities')
  findByTicketId(@Param('id') id: string) {
    return this.ticketActivityService.findByTicketId(id);
  }
}
