import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketRepository } from './ticket.repository';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersRepository } from '../users/users.repository';

@Module({
  imports: [AuthModule],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, PrismaService, JwtAuthGuard, UsersRepository],
})
export class TicketModule {}
