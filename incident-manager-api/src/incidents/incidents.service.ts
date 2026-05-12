import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { resolveScopedTenantId } from '../auth/utils/scoped-tenant';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import {
  FindAllIncidentFilters,
  IncidentsRepository,
} from './incidents.repository';

@Injectable()
export class IncidentsService {
  constructor(private readonly incidentsRepository: IncidentsRepository) {}

  async create(dto: CreateIncidentDto, user: AuthenticatedUser) {
    const tenantId = resolveScopedTenantId(user);
    return this.incidentsRepository.create(dto, { tenantId });
  }

  async findAll(filters: FindAllIncidentFilters = {}, user: AuthenticatedUser) {
    const scopedTenantId = resolveScopedTenantId(user);
    return this.incidentsRepository.findAll(filters, scopedTenantId);
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const scopedTenantId = resolveScopedTenantId(user);
    const incident = await this.incidentsRepository.findById(id, scopedTenantId);
    if (!incident) throw new NotFoundException(`Incident ${id} not found`);
    return incident;
  }

  async update(id: string, dto: UpdateIncidentDto, user: AuthenticatedUser) {
    await this.findOne(id, user);
    return this.incidentsRepository.update(id, dto);
  }

  async remove(id: string, user: AuthenticatedUser) {
    await this.findOne(id, user);
    return this.incidentsRepository.delete(id);
  }
}
