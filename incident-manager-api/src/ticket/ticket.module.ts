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

@Module({
  imports: [AuthModule],
  controllers: [TicketController],
  providers: [
    TicketService,
    TicketRepository,
    PrismaService,
    JwtAuthGuard,
    RolesGuard,
    UsersRepository,
    IncidentsRepository,
  ],
})
export class TicketModule {}
