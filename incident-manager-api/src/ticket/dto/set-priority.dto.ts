import { IsEnum, IsNotEmpty } from 'class-validator';
import { TicketPriority } from '../entities/ticket.entity';

export class SetPriorityDto {
  @IsEnum(TicketPriority)
  @IsNotEmpty()
  priority: TicketPriority;
}
