import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import {
  FindAllIncidentFilters,
  IncidentsRepository,
} from './incidents.repository';

@Injectable()
export class IncidentsService {
  constructor(private readonly incidentsRepository: IncidentsRepository) {}

  async create(dto: CreateIncidentDto) {
    return this.incidentsRepository.create(dto);
  }

  async findAll(filters: FindAllIncidentFilters = {}) {
    return this.incidentsRepository.findAll(filters);
  }

  async findOne(id: string) {
    const incident = await this.incidentsRepository.findById(id);
    if (!incident) throw new NotFoundException(`Incident ${id} not found`);
    return incident;
  }

  async update(id: string, dto: UpdateIncidentDto) {
    await this.findOne(id);
    return this.incidentsRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.incidentsRepository.delete(id);
  }
}
