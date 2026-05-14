import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketBase, TicketDetailModel } from './entities/ticket.entity';

const ticketTenantSelect = {
  id: true,
  name: true,
  alias: true,
} satisfies Prisma.TenantSelect;

const ticketBaseSelect = {
  code: true,
  title: true,
  priority: true,
  status: true,
  incidentId: true,
  createdAt: true,
  updatedAt: true,
  tenant: { select: ticketTenantSelect },
} satisfies Prisma.TicketSelect;

const ticketDetailSelect = {
  ...ticketBaseSelect,
  description: true,
  assignee: true,
} satisfies Prisma.TicketSelect;

type TicketBaseRecord = Prisma.TicketGetPayload<{
  select: typeof ticketBaseSelect;
}>;

type TicketDetailRecord = Prisma.TicketGetPayload<{
  select: typeof ticketDetailSelect;
}>;

@Injectable()
export class TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTicketDto, scopedTenantId?: string): Promise<TicketBase> {
    const incident = await this.prisma.incident.findFirst({
      where: {
        id: dto.incidentId,
        ...(scopedTenantId !== undefined ? { tenantId: scopedTenantId } : {}),
      },
      select: { tenantId: true },
    });
    if (!incident) {
      throw new NotFoundException(`Incident ${dto.incidentId} not found`);
    }
    const tenantId = incident.tenantId ?? scopedTenantId ?? null;

    const code = await this.getNewTicketCode();
    const createData: Prisma.TicketUncheckedCreateInput = {
      code,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      status: dto.status,
      // assignedTo: dto.assignedTo,
      incidentId: dto.incidentId,
      tenantId,
    };

    const ticket = await this.prisma.ticket.create({
      data: createData,
      select: ticketBaseSelect,
    });

    return this.mapTicketBase(ticket);
  }

  async findAll(scopedTenantId?: string): Promise<TicketBase[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: scopedTenantId ? { tenantId: scopedTenantId } : {},
      orderBy: { createdAt: 'desc' },
      select: ticketBaseSelect,
    });

    return tickets.map((ticket) => this.mapTicketBase(ticket));
  }

  async findByCode(code: string, scopedTenantId?: string): Promise<TicketDetailModel | null> {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        code,
        ...(scopedTenantId ? { tenantId: scopedTenantId } : {}),
      },
      select: ticketDetailSelect,
    });
    if (!ticket) return null;
    return this.mapTicketDetail(ticket);
  }

  async update(code: string, dto: UpdateTicketDto): Promise<TicketBase> {
    const ticket = await this.prisma.ticket.update({
      where: { code },
      data: dto,
      select: ticketBaseSelect,
    });

    return this.mapTicketBase(ticket);
  }

  async deleteByCode(code: string): Promise<TicketBase> {
    const ticket = await this.prisma.ticket.delete({
      where: { code },
      select: ticketBaseSelect,
    });
    return this.mapTicketBase(ticket);
  }

  private async getNewTicketCode(): Promise<string> {
    const seq = await this.prisma.$queryRaw<
      { nextval: bigint }[]
    >`SELECT nextval('ticket_code_seq')`;
    return `TKT-${String(seq[0].nextval).padStart(4, '0')}`;
  }

  private mapTicketBase(ticket: TicketBaseRecord): TicketBase {
    return {
      code: ticket.code,
      title: ticket.title,
      priority: ticket.priority,
      status: ticket.status,
      incidentId: ticket.incidentId,
      tenant: ticket.tenant
        ? { id: ticket.tenant.id, name: ticket.tenant.name, alias: ticket.tenant.alias }
        : null,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }

  private mapTicketDetail(ticket: TicketDetailRecord): TicketDetailModel {
    return {
      ...this.mapTicketBase(ticket),
      description: ticket.description,
      assignedUser: ticket.assignee
        ? { id: ticket.assignee.id, fullName: ticket.assignee.fullName, email: ticket.assignee.email }
        : null,
    };
  }
}
