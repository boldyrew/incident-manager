import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { PrismaService } from '../prisma/prisma.service';
import { IncidentsRepository } from './incidents.repository';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersRepository } from '../users/users.repository';

@Module({
  imports: [AuthModule],
  controllers: [IncidentsController],
  providers: [
    IncidentsService,
    IncidentsRepository,
    PrismaService,
    JwtAuthGuard,
    RolesGuard,
    UsersRepository,
  ],
})
export class IncidentsModule {}
