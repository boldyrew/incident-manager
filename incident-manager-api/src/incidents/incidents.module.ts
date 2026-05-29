import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { PrismaService } from '../prisma/prisma.service';
import { IncidentsRepository } from './incidents.repository';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersRepository } from '../users/users.repository';
import { IncidentActivityController } from './incident-activities/incident-activity.controller';
import { IncidentActivityService } from './incident-activities/incident-activity/incident-activity.service';
import { IncidentActivityRepository } from './incident-activities/incident-activity/incident-activity.repository';
import { IncidentActivityRecorder } from './incident-activities/incident-activity.recorder';

@Module({
  imports: [AuthModule],
  controllers: [IncidentsController, IncidentActivityController],
  providers: [
    IncidentsService,
    IncidentsRepository,
    PrismaService,
    JwtAuthGuard,
    RolesGuard,
    UsersRepository,
    IncidentActivityService,
    IncidentActivityRepository,
    IncidentActivityRecorder,
  ],
})
export class IncidentsModule {}
