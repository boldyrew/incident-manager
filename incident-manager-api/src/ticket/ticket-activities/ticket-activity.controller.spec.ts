import { TicketActivityController } from './ticket-activity.controller';
import { TicketActivityService } from './ticket-activity/ticket-activity.service';

describe('TicketActivityController', () => {
  it('lists activities for the ticket', () => {
    const service = { findByTicketId: jest.fn().mockReturnValue('activities') };
    const controller = new TicketActivityController(service as unknown as TicketActivityService);

    expect(controller.findByTicketId('t-1')).toBe('activities');
    expect(service.findByTicketId).toHaveBeenCalledWith('t-1');
  });
});
