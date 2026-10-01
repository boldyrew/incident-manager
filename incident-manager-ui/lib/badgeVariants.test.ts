import { getIncidentSeverityBadgeVariant, getIncidentStatusBadgeVariant } from './incidentBadgeVariants';
import { getTicketPriorityBadgeVariant, getTicketStatusBadgeVariant } from './ticketBadgeVariants';

describe.each([
  ['incident severity', getIncidentSeverityBadgeVariant],
  ['ticket priority', getTicketPriorityBadgeVariant],
])('%s badge variant', (_name, fn) => {
  it.each([
    ['CRITICAL', 'critical'],
    ['HIGH', 'warning'],
    ['MEDIUM', 'caution'],
    ['LOW', 'info'],
    ['UNKNOWN', 'neutral'],
  ])('%s -> %s', (value, expected) => {
    expect(fn(value as never)).toBe(expected);
  });
});

describe.each([
  ['incident status', getIncidentStatusBadgeVariant],
  ['ticket status', getTicketStatusBadgeVariant],
])('%s badge variant', (_name, fn) => {
  it.each([
    ['OPEN', 'info'],
    ['IN_PROGRESS', 'caution'],
    ['RESOLVED', 'success'],
    ['CLOSED', 'neutral'],
    ['UNKNOWN', 'neutral'],
  ])('%s -> %s', (value, expected) => {
    expect(fn(value as never)).toBe(expected);
  });
});
