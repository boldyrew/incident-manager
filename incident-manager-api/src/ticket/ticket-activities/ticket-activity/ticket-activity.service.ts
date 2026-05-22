import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketActivity } from '../entities/ticket-activity.entity';
import { TicketRepository } from '../../ticket.repository';
import { TicketActivityRepository } from './ticket-activity.repository';

@Injectable()
export class TicketActivityService {
  constructor(
    private readonly ticketActivityRepository: TicketActivityRepository,
    private readonly ticketRepository: TicketRepository,
  ) {}

  async findByTicketId(ticketId: string): Promise<TicketActivity[]> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket ${ticketId} not found`);
    }
    return this.ticketActivityRepository.findByTicketId(ticketId);
  }
}
