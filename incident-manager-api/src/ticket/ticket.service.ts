import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { resolveScopedTenantId } from '../auth/utils/scoped-tenant';
import { IncidentsRepository } from '../incidents/incidents.repository';
import { UsersRepository } from '../users/users.repository';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketDetailModel } from './entities/ticket.entity';
import { TicketActivityRecorder } from './ticket-activities/ticket-activity.recorder';
import { TicketRepository } from './ticket.repository';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly usersRepository: UsersRepository,
    private readonly incidentsRepository: IncidentsRepository,
    private readonly ticketActivityRecorder: TicketActivityRecorder,
  ) {}

  async create(createTicketDto: CreateTicketDto, user: AuthenticatedUser) {
    const scopedTenantId = resolveScopedTenantId(user);
    const ticket = await this.ticketRepository.create(createTicketDto, scopedTenantId);
    await this.ticketActivityRecorder.recordTicketOpened(
      ticket.id,
      user.sub,
      ticket.priority,
      ticket.status,
    );
    return ticket;
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

  async update(id: string, updateTicketDto: UpdateTicketDto, actor?: AuthenticatedUser) {
    const before = await this.findOne(id);
    const ticket = await this.ticketRepository.update(id, updateTicketDto);
    const after = await this.findOne(id);
    // await this.recordUpdateActivities(id, actor?.sub, before, after);
    return ticket;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.ticketRepository.delete(id);
  }

  async assign(id: string, userId: string | null | undefined, actor?: AuthenticatedUser) {
    if (userId === undefined) {
      throw new BadRequestException('userId is required (use null to clear assignment)');
    }
    if (userId === null || userId === '') {
      const ticket = await this.ticketRepository.update(id, { assignedUserId: null });
      await this.ticketActivityRecorder.recordAssigneeUpdated(id, actor?.sub, null);
      return ticket;
    }

    const targetUser = await this.usersRepository.findById(userId);
    if (targetUser.role !== 'ANALYST')
      throw new BadRequestException(`User ${userId} is not an analyst`);

    const ticket = await this.ticketRepository.update(id, { assignedUserId: userId });
    await this.ticketActivityRecorder.recordAssigneeUpdated(id, actor?.sub, userId);

    return ticket;
  }

  async linkIncident(id: string, incidentId: string | null, actor?: AuthenticatedUser) {
    if (incidentId === undefined) {
      throw new BadRequestException('incidentId is required (use null to clear link)');
    }
    if (incidentId === null || incidentId === '') {
      const ticket = await this.ticketRepository.update(id, { incidentId: null });
      await this.ticketActivityRecorder.recordIncidentLinked(id, actor?.sub, null);
      return ticket;
    }

    const incident = await this.incidentsRepository.findById(incidentId);
    const ticket = await this.ticketRepository.findById(id);
    if (incident && incident.tenant.id !== ticket.tenant.id) {
      throw new BadRequestException(`Invalid incident`);
    }
    await this.ticketRepository.update(id, { incidentId });
    await this.ticketActivityRecorder.recordIncidentLinked(id, actor?.sub, incidentId);
    return ticket;
  }

  async setStatus(id: string, status: TicketStatus, actor?: AuthenticatedUser) {
    const before = await this.findOne(id);
    const ticket = await this.ticketRepository.update(id, { status });
    await this.ticketActivityRecorder.recordStatusUpdated(id, actor?.sub, before.status, status);
    return ticket;
  }

  // private async recordUpdateActivities(
  //   ticketId: string,
  //   actorId: string | undefined,
  //   before: TicketDetailModel,
  //   after: TicketDetailModel,
  // ) {
  //   await Promise.all([
  //     this.ticketActivityRecorder.recordTitleUpdated(
  //       ticketId,
  //       actorId,
  //       before.title,
  //       after.title,
  //     ),
  //     this.ticketActivityRecorder.recordDescriptionUpdated(
  //       ticketId,
  //       actorId,
  //       before.description,
  //       after.description,
  //     ),
  //     this.ticketActivityRecorder.recordPriorityUpdated(
  //       ticketId,
  //       actorId,
  //       before.priority,
  //       after.priority,
  //     ),
  //     this.ticketActivityRecorder.recordStatusUpdated(
  //       ticketId,
  //       actorId,
  //       before.status,
  //       after.status,
  //     ),
  //     this.ticketActivityRecorder.recordAssigneeUpdated(
  //       ticketId,
  //       actorId,
  //       before.assignedUser?.id ?? null,
  //       after.assignedUser?.id ?? null,
  //     ),
  //     this.ticketActivityRecorder.recordIncidentLinked(
  //       ticketId,
  //       actorId,
  //       before.incidentId,
  //       after.incidentId,
  //     ),
  //   ]);
  // }
}
