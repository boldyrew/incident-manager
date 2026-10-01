import {
  createAssigneeUpdatedActivity,
  createCommentAddedActivity,
  createDescriptionUpdatedActivity,
  createIncidentOpenedActivity,
  createSeverityUpdatedActivity,
  createStatusUpdatedActivity,
  createTitleUpdatedActivity,
} from './incident-activity.factory';

describe('incident activity factory', () => {
  it('builds INCIDENT_OPENED', () => {
    expect(
      createIncidentOpenedActivity('inc-1', 'user-1', { severity: 'HIGH', status: 'OPEN' }),
    ).toEqual({
      incidentId: 'inc-1',
      userId: 'user-1',
      type: 'INCIDENT_OPENED',
      metadata: { severity: 'HIGH', status: 'OPEN' },
      plainData: 'Incident opened (OPEN, HIGH severity)',
    });
  });

  it('builds STATUS_UPDATED', () => {
    expect(
      createStatusUpdatedActivity('inc-1', 'user-1', { from: 'OPEN', to: 'RESOLVED' }),
    ).toMatchObject({
      type: 'STATUS_UPDATED',
      metadata: { from: 'OPEN', to: 'RESOLVED' },
      plainData: 'Status changed from OPEN to RESOLVED',
    });
  });

  it('builds SEVERITY_UPDATED', () => {
    expect(
      createSeverityUpdatedActivity('inc-1', 'user-1', { from: 'LOW', to: 'CRITICAL' }),
    ).toMatchObject({
      type: 'SEVERITY_UPDATED',
      metadata: { from: 'LOW', to: 'CRITICAL' },
      plainData: 'Severity changed from LOW to CRITICAL',
    });
  });

  it('builds ASSIGNEE_UPDATED without plainData', () => {
    const activity = createAssigneeUpdatedActivity('inc-1', 'user-1', { assignedUserId: 'a-1' });
    expect(activity).toMatchObject({
      type: 'ASSIGNEE_UPDATED',
      metadata: { assignedUserId: 'a-1' },
    });
    expect(activity.plainData).toBeUndefined();
  });

  it('builds COMMENT_ADDED', () => {
    expect(createCommentAddedActivity('inc-1', 'user-1', { body: 'hello' })).toMatchObject({
      type: 'COMMENT_ADDED',
      metadata: { body: 'hello' },
      plainData: 'Comment added',
    });
  });

  it('builds DESCRIPTION_UPDATED', () => {
    expect(
      createDescriptionUpdatedActivity('inc-1', 'user-1', { from: null, to: 'new' }),
    ).toMatchObject({
      type: 'DESCRIPTION_UPDATED',
      metadata: { from: null, to: 'new' },
      plainData: 'Description updated',
    });
  });

  it('builds TITLE_UPDATED', () => {
    expect(createTitleUpdatedActivity('inc-1', 'user-1', { from: 'a', to: 'b' })).toMatchObject({
      type: 'TITLE_UPDATED',
      metadata: { from: 'a', to: 'b' },
      plainData: 'Title changed from "a" to "b"',
    });
  });

  it.each([undefined, null])('normalises a %s userId to null', (userId) => {
    expect(createCommentAddedActivity('inc-1', userId, { body: 'x' }).userId).toBeNull();
  });
});
