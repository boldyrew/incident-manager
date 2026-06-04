import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { incidentBaseSelect } from '../incidents/incidents.repository';
import { tenantSelect } from '../prisma/selections';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketBase, TicketDetailModel } from './entities/ticket.entity';

const assigneeSelect = { id: true, fullName: true, email: true } satisfies Prisma.UserSelect;

const ticketBaseSelect = {
  id: true,
  code: true,
  title: true,
  priority: true,
  status: true,
  incidentId: true,
  createdAt: true,
  updatedAt: true,
  tenant: { select: tenantSelect },
  assignee: { select: assigneeSelect },
  incident: { select: incidentBaseSelect },
} satisfies Prisma.TicketSelect;

const ticketDetailSelect = {
  ...ticketBaseSelect,
  description: true,
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
    const tenantId = scopedTenantId ?? dto.tenantId ?? null;
    if (tenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true },
      });
      if (!tenant) {
        throw new NotFoundException(`Tenant ${tenantId} not found`);
      }
    }

    if (dto.incidentId) {
      const incident = await this.prisma.incident.findFirst({
        where: {
          id: dto.incidentId,
          ...(tenantId !== null ? { tenantId } : {}),
          ...(scopedTenantId !== undefined ? { tenantId: scopedTenantId } : {}),
        },
        select: { id: true },
      });
      if (!incident) {
        throw new NotFoundException(`Incident ${dto.incidentId} not found`);
      }
    }

    const code = await this.getNewTicketCode();
    const createData: Prisma.TicketUncheckedCreateInput = {
      code,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      status: dto.status,
      incidentId: dto.incidentId ?? null,
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

  async findById(id: string): Promise<TicketDetailModel | null> {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id },
      select: ticketDetailSelect,
    });
    if (!ticket) return null;
    return this.mapTicketDetail(ticket);
  }

  async update(id: string, dto: UpdateTicketDto): Promise<TicketBase> {
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: dto,
      select: ticketBaseSelect,
    });

    return this.mapTicketBase(ticket);
  }

  async delete(id: string): Promise<TicketBase> {
    const ticket = await this.prisma.ticket.delete({
      where: { id },
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
      id: ticket.id,
      code: ticket.code,
      title: ticket.title,
      priority: ticket.priority,
      status: ticket.status,
      incidentId: ticket.incidentId,
      assignedUser: ticket.assignee
        ? {
            id: ticket.assignee.id,
            fullName: ticket.assignee.fullName,
            email: ticket.assignee.email,
          }
        : null,
      incident: ticket.incident
        ? {
            id: ticket.incident.id,
            code: ticket.incident.code,
            title: ticket.incident.title,
            status: ticket.incident.status,
            severity: ticket.incident.severity,
            detectedAt: ticket.incident.detectedAt,
            resolvedAt: ticket.incident.resolvedAt ?? null,
          }
        : null,
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
    };
  }
}
