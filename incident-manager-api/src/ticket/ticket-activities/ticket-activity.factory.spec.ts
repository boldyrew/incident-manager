import {
  createAssigneeUpdatedActivity,
  createCommentAddedActivity,
  createDescriptionUpdatedActivity,
  createIncidentLinkedActivity,
  createPriorityUpdatedActivity,
  createStatusUpdatedActivity,
  createTicketOpenedActivity,
  createTitleUpdatedActivity,
} from './ticket-activity.factory';

describe('ticket activity factory', () => {
  it('builds TICKET_OPENED', () => {
    expect(
      createTicketOpenedActivity('t-1', 'user-1', { priority: 'HIGH', status: 'OPEN' }),
    ).toEqual({
      ticketId: 't-1',
      userId: 'user-1',
      type: 'TICKET_OPENED',
      metadata: { priority: 'HIGH', status: 'OPEN' },
      plainData: 'Ticket opened (OPEN, HIGH priority)',
    });
  });

  it('builds STATUS_UPDATED', () => {
    expect(createStatusUpdatedActivity('t-1', 'u', { from: 'OPEN', to: 'CLOSED' })).toMatchObject({
      type: 'STATUS_UPDATED',
      plainData: 'Status changed from OPEN to CLOSED',
    });
  });

  it('builds PRIORITY_UPDATED', () => {
    expect(createPriorityUpdatedActivity('t-1', 'u', { from: 'LOW', to: 'HIGH' })).toMatchObject({
      type: 'PRIORITY_UPDATED',
      metadata: { from: 'LOW', to: 'HIGH' },
      plainData: 'Priority changed from LOW to HIGH',
    });
  });

  it('builds ASSIGNEE_UPDATED and INCIDENT_LINKED without plainData', () => {
    const assignee = createAssigneeUpdatedActivity('t-1', 'u', { assignedUserId: null });
    const linked = createIncidentLinkedActivity('t-1', 'u', { incidentId: 'inc-1' });
    expect(assignee).toMatchObject({ type: 'ASSIGNEE_UPDATED', metadata: { assignedUserId: null } });
    expect(linked).toMatchObject({ type: 'INCIDENT_LINKED', metadata: { incidentId: 'inc-1' } });
    expect(assignee.plainData).toBeUndefined();
    expect(linked.plainData).toBeUndefined();
  });

  it('builds COMMENT_ADDED, DESCRIPTION_UPDATED and TITLE_UPDATED', () => {
    expect(createCommentAddedActivity('t-1', 'u', { body: 'b' }).plainData).toBe('Comment added');
    expect(createDescriptionUpdatedActivity('t-1', 'u', { from: 'a', to: null }).plainData).toBe(
      'Description updated',
    );
    expect(createTitleUpdatedActivity('t-1', 'u', { from: 'a', to: 'b' }).plainData).toBe(
      'Title changed from "a" to "b"',
    );
  });

  it('normalises an undefined userId to null', () => {
    expect(createCommentAddedActivity('t-1', undefined, { body: 'x' }).userId).toBeNull();
  });
});
