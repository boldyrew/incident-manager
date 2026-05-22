import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketActivity } from '../entities/ticket-activity.entity';
import {
  parseTicketActivity,
  ticketActivitySelect,
  TicketActivityRecord,
} from '../ticket-activity.mapper';

@Injectable()
export class TicketActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TicketActivityUncheckedCreateInput): Promise<TicketActivity> {
    const record = await this.prisma.ticketActivity.create({
      data,
      select: ticketActivitySelect,
    });
    return parseTicketActivity(record);
  }

  async findByTicketId(ticketId: string): Promise<TicketActivity[]> {
    const records = await this.prisma.ticketActivity.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
      select: ticketActivitySelect,
    });
    return records.map((record) => parseTicketActivity(record));
  }

  async createMany(data: Prisma.TicketActivityUncheckedCreateInput[]): Promise<TicketActivity[]> {
    if (data.length === 0) return [];

    const records = await this.prisma.$transaction(
      data.map((item) =>
        this.prisma.ticketActivity.create({
          data: item,
          select: ticketActivitySelect,
        }),
      ),
    );

    return records.map((record: TicketActivityRecord) => parseTicketActivity(record));
  }
}
