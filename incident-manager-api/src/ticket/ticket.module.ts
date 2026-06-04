import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketRepository } from './ticket.repository';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersRepository } from '../users/users.repository';
import { IncidentsRepository } from 'src/incidents/incidents.repository';
import { TicketActivityController } from './ticket-activities/ticket-activity.controller';
import { TicketActivityService } from './ticket-activities/ticket-activity/ticket-activity.service';
import { TicketActivityRepository } from './ticket-activities/ticket-activity/ticket-activity.repository';
import { TicketActivityRecorder } from './ticket-activities/ticket-activity.recorder';

@Module({
  imports: [AuthModule],
  controllers: [TicketController, TicketActivityController],
  providers: [
    TicketService,
    TicketRepository,
    PrismaService,
    JwtAuthGuard,
    RolesGuard,
    UsersRepository,
    IncidentsRepository,
    TicketActivityService,
    TicketActivityRepository,
    TicketActivityRecorder,
  ],
})
export class TicketModule {}
