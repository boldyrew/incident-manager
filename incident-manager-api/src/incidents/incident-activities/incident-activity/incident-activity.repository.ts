import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IncidentActivity } from '../entities/incident-activity.entity';
import {
  incidentActivitySelect,
  IncidentActivityRecord,
  parseIncidentActivity,
} from '../incident-activity.mapper';

@Injectable()
export class IncidentActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.IncidentActivityCreateInput): Promise<IncidentActivity> {
    const record = await this.prisma.incidentActivity.create({
      data,
      select: incidentActivitySelect,
    });
    return parseIncidentActivity(record);
  }

  async findByIncidentId(incidentId: string): Promise<IncidentActivity[]> {
    const records = await this.prisma.incidentActivity.findMany({
      where: { incidentId },
      orderBy: { createdAt: 'desc' },
      select: incidentActivitySelect,
    });
    return records.map((record: IncidentActivityRecord) => parseIncidentActivity(record));
  }
}
