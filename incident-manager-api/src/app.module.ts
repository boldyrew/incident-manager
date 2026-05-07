import { Module } from '@nestjs/common';
import { IncidentsModule } from './incidents/incidents.module';
import { TicketModule } from './ticket/ticket.module';

@Module({
  imports: [IncidentsModule, TicketModule],
})
export class AppModule {}
