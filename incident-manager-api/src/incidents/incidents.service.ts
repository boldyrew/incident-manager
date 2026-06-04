import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { resolveScopedTenantId } from '../auth/utils/scoped-tenant';
import { UsersRepository } from '../users/users.repository';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { FindAllIncidentFilters, IncidentsRepository } from './incidents.repository';
import { Incident } from './entities/incident.entity';
import { IncidentActivityRecorder } from './incident-activities/incident-activity.recorder';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly incidentsRepository: IncidentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly incidentActivityRecorder: IncidentActivityRecorder,
  ) {}

  async create(dto: CreateIncidentDto, user: AuthenticatedUser) {
    const tenantId = resolveScopedTenantId(user);
    const incident = await this.incidentsRepository.create(dto, { tenantId });
    await this.incidentActivityRecorder.recordIncidentOpened(
      incident.id,
      user.sub,
      incident.severity,
      incident.status,
    );
    return incident;
  }

  async findAll(filters: FindAllIncidentFilters = {}, user: AuthenticatedUser) {
    const scopedTenantId =
      user.role !== 'CLIENT_USER' ? filters.tenantId : resolveScopedTenantId(user);
    return this.incidentsRepository.findAll(filters, scopedTenantId);
  }

  async findOne(id: string): Promise<Incident> {
    const incident = await this.incidentsRepository.findById(id);
    if (!incident) throw new NotFoundException(`Incident ${id} not found`);
    return incident;
  }

  async update(id: string, dto: UpdateIncidentDto) {
    await this.findOne(id);
    return this.incidentsRepository.update(id, dto);
  }

  async updateTitle(id: string, title: string, actor?: AuthenticatedUser) {
    const before = await this.findOne(id);
    const trimmed = title.trim();
    if (!trimmed) {
      throw new BadRequestException('Title is required');
    }
    if (trimmed === before.title) {
      return before;
    }
    await this.incidentsRepository.update(id, { title: trimmed });
    await this.incidentActivityRecorder.recordTitleUpdated(id, actor?.sub, before.title, trimmed);
    return this.findOne(id);
  }

  async updateDescription(id: string, description: string | undefined, actor?: AuthenticatedUser) {
    const before = await this.findOne(id);
    const next = description?.trim() || null;
    if (next === (before.description ?? null)) {
      return before;
    }
    await this.incidentsRepository.update(id, { description: next });
    await this.incidentActivityRecorder.recordDescriptionUpdated(
      id,
      actor?.sub,
      before.description ?? null,
      next,
    );
    return this.findOne(id);
  }

  async setStatus(id: string, status: IncidentStatus, actor?: AuthenticatedUser) {
    const before = await this.findOne(id);
    if (before.status === status) {
      return before;
    }
    const incident = await this.incidentsRepository.update(id, { status });
    await this.incidentActivityRecorder.recordStatusUpdated(id, actor?.sub, before.status, status);
    return incident;
  }

  async setSeverity(id: string, severity: IncidentSeverity, actor?: AuthenticatedUser) {
    const before = await this.findOne(id);
    if (before.severity === severity) {
      return before;
    }
    const incident = await this.incidentsRepository.update(id, { severity });
    await this.incidentActivityRecorder.recordSeverityUpdated(
      id,
      actor?.sub,
      before.severity,
      severity,
    );
    return incident;
  }

  async assign(id: string, userId: string | null | undefined, actor?: AuthenticatedUser) {
    if (userId === undefined) {
      throw new BadRequestException('userId is required (use null to clear assignment)');
    }

    await this.findOne(id);

    if (userId === null || userId === '') {
      const incident = await this.incidentsRepository.update(id, { assignedUserId: null });
      await this.incidentActivityRecorder.recordAssigneeUpdated(id, actor?.sub, null);
      return incident;
    }

    const targetUser = await this.usersRepository.findById(userId);
    if (targetUser.role !== 'ANALYST') {
      throw new BadRequestException(`User ${userId} is not an analyst`);
    }

    const incident = await this.incidentsRepository.update(id, { assignedUserId: userId });
    await this.incidentActivityRecorder.recordAssigneeUpdated(id, actor?.sub, userId);
    return incident;
  }

  async addComment(id: string, body: string, actor: AuthenticatedUser) {
    await this.findOne(id);
    const trimmed = body.trim();
    if (!trimmed) {
      throw new BadRequestException('Comment body is required');
    }
    return this.incidentActivityRecorder.recordCommentAdded(id, actor.sub, trimmed);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.incidentsRepository.delete(id);
  }
}
