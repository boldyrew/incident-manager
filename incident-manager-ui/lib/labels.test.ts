import { incidentSeverityLabel } from './incidentSeverityLabels';
import { incidentStatusLabel } from './incidentStatusLabels';
import { ticketPriorityLabel } from './ticketPriorityLabels';
import { ticketStatusLabel } from './ticketStatusLabels';

describe('label maps', () => {
  it('cover every severity/priority', () => {
    const expected = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical' };
    expect(incidentSeverityLabel).toEqual(expected);
    expect(ticketPriorityLabel).toEqual(expected);
  });

  it('cover every status', () => {
    const expected = { OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };
    expect(incidentStatusLabel).toEqual(expected);
    expect(ticketStatusLabel).toEqual(expected);
  });
});
