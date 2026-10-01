import { makeIncidentActivity, makeTicketActivity } from '@/test-utils/fixtures';
import * as incidentDisplay from './incidentActivityDisplay';
import * as ticketDisplay from './ticketActivityDisplay';

describe('incident activity display', () => {
  it.each([
    ['INCIDENT_OPENED', 'created'],
    ['STATUS_UPDATED', 'status_change'],
    ['SEVERITY_UPDATED', 'status_change'],
    ['ASSIGNEE_UPDATED', 'assigned'],
    ['COMMENT_ADDED', 'comment'],
    ['DESCRIPTION_UPDATED', 'updated'],
    ['TITLE_UPDATED', 'updated'],
  ] as const)('%s -> %s', (type, visual) => {
    expect(incidentDisplay.getActivityVisualType(type)).toBe(visual);
  });

  it('names the actor or falls back to System', () => {
    const activity = makeIncidentActivity('COMMENT_ADDED', { body: 'x' });
    expect(incidentDisplay.getActivityActorName(activity)).toBe('Jane Analyst');
    expect(incidentDisplay.getActivityActorName({ ...activity, actor: null })).toBe('System');
  });

  it('only exposes content for comments', () => {
    expect(
      incidentDisplay.getActivityContent(makeIncidentActivity('COMMENT_ADDED', { body: 'note' })),
    ).toBe('note');
    expect(
      incidentDisplay.getActivityContent(makeIncidentActivity('TITLE_UPDATED', { from: 'a', to: 'b' })),
    ).toBeUndefined();
  });
});

describe('ticket activity display', () => {
  it.each([
    ['TICKET_OPENED', 'created'],
    ['STATUS_UPDATED', 'status_change'],
    ['PRIORITY_UPDATED', 'status_change'],
    ['ASSIGNEE_UPDATED', 'assigned'],
    ['COMMENT_ADDED', 'comment'],
    ['INCIDENT_LINKED', 'updated'],
    ['DESCRIPTION_UPDATED', 'updated'],
    ['TITLE_UPDATED', 'updated'],
  ] as const)('%s -> %s', (type, visual) => {
    expect(ticketDisplay.getActivityVisualType(type)).toBe(visual);
  });

  it('names the actor or falls back to System', () => {
    const activity = makeTicketActivity('COMMENT_ADDED', { body: 'x' });
    expect(ticketDisplay.getActivityActorName(activity)).toBe('Jane Analyst');
    expect(ticketDisplay.getActivityActorName({ ...activity, actor: null })).toBe('System');
  });

  it('only exposes content for comments', () => {
    expect(ticketDisplay.getActivityContent(makeTicketActivity('COMMENT_ADDED', { body: 'n' }))).toBe('n');
    expect(
      ticketDisplay.getActivityContent(makeTicketActivity('STATUS_UPDATED', { from: 'OPEN', to: 'CLOSED' })),
    ).toBeUndefined();
  });
});
