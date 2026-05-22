import { Test, TestingModule } from '@nestjs/testing';
import { TicketActivityService } from './ticket-activity.service';
import { TicketActivityRepository } from './ticket-activity.repository';
import { TicketRepository } from '../../ticket.repository';

describe('TicketActivityService', () => {
  let service: TicketActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketActivityService,
        { provide: TicketActivityRepository, useValue: {} },
        { provide: TicketRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<TicketActivityService>(TicketActivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
