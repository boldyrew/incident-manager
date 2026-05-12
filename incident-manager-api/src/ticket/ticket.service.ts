import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { resolveScopedTenantId } from '../auth/utils/scoped-tenant';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketRepository } from './ticket.repository';

@Injectable()
export class TicketService {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async create(createTicketDto: CreateTicketDto, user: AuthenticatedUser) {
    const scopedTenantId = resolveScopedTenantId(user);
    return this.ticketRepository.create(createTicketDto, scopedTenantId);
  }

  findAll(user: AuthenticatedUser) {
    const scopedTenantId = resolveScopedTenantId(user);
    return this.ticketRepository.findAll(scopedTenantId);
  }

  async findOne(code: string, user: AuthenticatedUser) {
    const scopedTenantId = resolveScopedTenantId(user);
    const ticket = await this.ticketRepository.findByCode(code, scopedTenantId);
    if (!ticket) throw new NotFoundException(`Ticket ${code} not found`);
    return ticket;
  }

  async update(code: string, updateTicketDto: UpdateTicketDto, user: AuthenticatedUser) {
    await this.findOne(code, user);
    return this.ticketRepository.update(code, updateTicketDto);
  }

  async remove(code: string, user: AuthenticatedUser) {
    await this.findOne(code, user);
    return this.ticketRepository.deleteByCode(code);
  }
}
