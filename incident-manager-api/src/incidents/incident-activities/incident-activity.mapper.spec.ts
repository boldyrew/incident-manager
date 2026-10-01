import { IncidentActivityRecord, parseIncidentActivity } from './incident-activity.mapper';

function makeRecord(overrides: Partial<IncidentActivityRecord> = {}): IncidentActivityRecord {
  return {
    id: 'act-1',
    type: 'COMMENT_ADDED',
    userId: 'user-1',
    incidentId: 'inc-1',
    plainData: 'Comment added',
    metadata: { body: 'hi' },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    user: { id: 'user-1', fullName: 'Jane Analyst', email: 'jane@secureops.io' },
    ...overrides,
  };
}

describe('parseIncidentActivity', () => {
  it('maps base fields and the actor', () => {
    const record = makeRecord();
    expect(parseIncidentActivity(record)).toEqual({
      id: 'act-1',
      incidentId: 'inc-1',
      userId: 'user-1',
      actor: { id: 'user-1', fullName: 'Jane Analyst', email: 'jane@secureops.io' },
      plainData: 'Comment added',
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      type: 'COMMENT_ADDED',
      metadata: { body: 'hi' },
    });
  });

  it('maps a missing user to a null actor', () => {
    expect(parseIncidentActivity(makeRecord({ user: null, userId: null })).actor).toBeNull();
  });

  it.each([
    ['INCIDENT_OPENED', { severity: 'HIGH', status: 'OPEN' }],
    ['STATUS_UPDATED', { from: 'OPEN', to: 'RESOLVED' }],
    ['SEVERITY_UPDATED', { from: 'LOW', to: 'HIGH' }],
    ['ASSIGNEE_UPDATED', { assignedUserId: 'u-2' }],
    ['COMMENT_ADDED', { body: 'note' }],
    ['DESCRIPTION_UPDATED', { from: null, to: 'desc' }],
    ['TITLE_UPDATED', { from: 'a', to: 'b' }],
  ] as const)('parses %s metadata', (type, metadata) => {
    const activity = parseIncidentActivity(makeRecord({ type, metadata }));
    expect(activity.type).toBe(type);
    expect(activity.metadata).toEqual(metadata);
  });

  it('propagates metadata validation errors', () => {
    expect(() =>
      parseIncidentActivity(makeRecord({ type: 'STATUS_UPDATED', metadata: { from: 'X' } })),
    ).toThrow('Invalid from in activity metadata');
  });

  it('throws on an unknown activity type', () => {
    expect(() => parseIncidentActivity(makeRecord({ type: 'BOGUS' as never }))).toThrow(
      'Unhandled incident activity type: BOGUS',
    );
  });
});
