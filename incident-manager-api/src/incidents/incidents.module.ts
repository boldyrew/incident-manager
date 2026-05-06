import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { PrismaService } from '../prisma/prisma.service';
import { IncidentsRepository } from './incidents.repository';

@Module({
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentsRepository, PrismaService],
})
export class IncidentsModule {}
