import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';
import { UsersRepository } from '../users/users.repository';
import { IncidentsRepository } from '../incidents/incidents.repository';
import { TicketActivityRecorder } from './ticket-activities/ticket-activity.recorder';

describe('TicketService', () => {
  let service: TicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: TicketRepository, useValue: {} },
        { provide: UsersRepository, useValue: {} },
        { provide: IncidentsRepository, useValue: {} },
        { provide: TicketActivityRecorder, useValue: {} },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
