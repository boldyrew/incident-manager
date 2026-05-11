import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { PrismaService } from '../prisma/prisma.service';
import { IncidentsRepository } from './incidents.repository';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [AuthModule],
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentsRepository, PrismaService, JwtAuthGuard],
})
export class IncidentsModule {}
