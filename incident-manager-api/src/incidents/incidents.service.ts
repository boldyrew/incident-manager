import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { resolveScopedTenantId } from '../auth/utils/scoped-tenant';
import { UsersRepository } from '../users/users.repository';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { FindAllIncidentFilters, IncidentsRepository } from './incidents.repository';
import { Incident } from './entities/incident.entity';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly incidentsRepository: IncidentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(dto: CreateIncidentDto, user: AuthenticatedUser) {
    const tenantId = resolveScopedTenantId(user);
    return this.incidentsRepository.create(dto, { tenantId });
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

  async assign(id: string, userId: string | null | undefined) {
    if (userId === undefined) {
      throw new BadRequestException('userId is required (use null to clear assignment)');
    }

    await this.findOne(id);

    if (userId === null || userId === '') {
      return this.incidentsRepository.update(id, { assignedUserId: null });
    }

    const targetUser = await this.usersRepository.findById(userId);
    if (targetUser.role !== 'ANALYST') {
      throw new BadRequestException(`User ${userId} is not an analyst`);
    }

    return this.incidentsRepository.update(id, { assignedUserId: userId });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.incidentsRepository.delete(id);
  }
}
