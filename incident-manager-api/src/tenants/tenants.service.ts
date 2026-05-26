import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantsRepository } from './tenants.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly tenantsRepository: TenantsRepository) {}

  create(dto: CreateTenantDto) {
    return this.tenantsRepository.create(dto);
  }

  findAll() {
    return this.tenantsRepository.findAll();
  }

  async findOne(id: string) {
    const tenant = await this.tenantsRepository.findById(id);
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    return this.tenantsRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.tenantsRepository.delete(id);
  }

  getGlobalStats() {
    return this.tenantsRepository.getGlobalStats();
  }
}
