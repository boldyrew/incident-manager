import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketRepository } from './ticket.repository';

@Injectable()
export class TicketService {
  constructor(private readonly ticketRepository: TicketRepository) {}

  create(createTicketDto: CreateTicketDto) {
    return this.ticketRepository.create(createTicketDto);
  }

  findAll() {
    return this.ticketRepository.findAll();
  }

  async findOne(id: string) {
    const ticket = await this.ticketRepository.findByCode(id);
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
}
