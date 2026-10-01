import { IncidentActivityController } from './incident-activity.controller';
import { IncidentActivityService } from './incident-activity/incident-activity.service';

describe('IncidentActivityController', () => {
  it('lists activities for the incident', () => {
    const service = { findByIncidentId: jest.fn().mockReturnValue('activities') };
    const controller = new IncidentActivityController(service as unknown as IncidentActivityService);

    expect(controller.findByIncidentId('inc-1')).toBe('activities');
    expect(service.findByIncidentId).toHaveBeenCalledWith('inc-1');
  });
});
