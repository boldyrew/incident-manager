import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { resolveScopedTenantId } from '../auth/utils/scoped-tenant';
import { IncidentsRepository } from '../incidents/incidents.repository';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketRepository } from './ticket.repository';
import { UsersRepository } from '../users/users.repository';
import { TicketDetailModel } from './entities/ticket.entity';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly usersRepository: UsersRepository,
    private readonly incidentsRepository: IncidentsRepository,
  ) {}

  async create(createTicketDto: CreateTicketDto, user: AuthenticatedUser) {
    const scopedTenantId = resolveScopedTenantId(user);
    return this.ticketRepository.create(createTicketDto, scopedTenantId);
  }

  findAll(user: AuthenticatedUser) {
    const scopedTenantId = resolveScopedTenantId(user);
    return this.ticketRepository.findAll(scopedTenantId);
  }

  async findOne(id: string): Promise<TicketDetailModel> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    await this.findOne(id);
    return this.ticketRepository.update(id, updateTicketDto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.ticketRepository.delete(id);
  }

  async assign(id: string, userId: string | null | undefined) {
    await this.findOne(id);
    if (userId === undefined) {
      throw new BadRequestException('userId is required (use null to clear assignment)');
    }
    if (userId === null || userId === '') {
      return this.ticketRepository.update(id, { assignedUserId: null });
    }
    const targetUser = await this.usersRepository.findByUserId(userId);
    if (targetUser.role !== 'ANALYST')
      throw new BadRequestException(`User ${userId} is not an analyst`);
    return this.ticketRepository.update(id, { assignedUserId: userId });
  }

  async linkIncident(id: string, incidentId: string | null) {
    if (incidentId === undefined) {
      throw new BadRequestException('incidentId is required (use null to clear link)');
    }

    const ticket = await this.findOne(id);
    if (incidentId === null || incidentId === '') {
      return this.ticketRepository.update(id, { incidentId: null });
    }

    const incident = await this.incidentsRepository.findById(incidentId);
    if (incident && ticket.tenant && incident.tenant.id !== ticket.tenant.id) {
      throw new BadRequestException(`Invalid incident`);
    }
    return this.ticketRepository.update(id, { incidentId });
  }

  async setStatus(id: string, status: TicketStatus) {
    await this.findOne(id);
    return this.ticketRepository.update(id, { status });
  }
}
