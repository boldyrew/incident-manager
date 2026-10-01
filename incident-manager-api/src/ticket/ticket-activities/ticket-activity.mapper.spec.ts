import { parseTicketActivity, TicketActivityRecord } from './ticket-activity.mapper';

function makeRecord(overrides: Partial<TicketActivityRecord> = {}): TicketActivityRecord {
  return {
    id: 'act-1',
    type: 'COMMENT_ADDED',
    userId: 'user-1',
    ticketId: 't-1',
    plainData: 'Comment added',
    metadata: { body: 'hi' },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    user: { id: 'user-1', fullName: 'Jane Analyst', email: 'jane@secureops.io' },
    ...overrides,
  };
}

describe('parseTicketActivity', () => {
  it('maps base fields and the actor', () => {
    const record = makeRecord();
    expect(parseTicketActivity(record)).toEqual({
      id: 'act-1',
      ticketId: 't-1',
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
    expect(parseTicketActivity(makeRecord({ user: null })).actor).toBeNull();
  });

  it.each([
    ['TICKET_OPENED', { priority: 'HIGH', status: 'OPEN' }],
    ['STATUS_UPDATED', { from: 'OPEN', to: 'RESOLVED' }],
    ['PRIORITY_UPDATED', { from: 'LOW', to: 'HIGH' }],
    ['ASSIGNEE_UPDATED', { assignedUserId: 'u-2' }],
    ['INCIDENT_LINKED', { incidentId: 'inc-1' }],
    ['COMMENT_ADDED', { body: 'note' }],
    ['DESCRIPTION_UPDATED', { from: null, to: 'desc' }],
    ['TITLE_UPDATED', { from: 'a', to: 'b' }],
  ] as const)('parses %s metadata', (type, metadata) => {
    const activity = parseTicketActivity(makeRecord({ type, metadata }));
    expect(activity.type).toBe(type);
    expect(activity.metadata).toEqual(metadata);
  });

  it('throws on an unknown activity type', () => {
    expect(() => parseTicketActivity(makeRecord({ type: 'BOGUS' as never }))).toThrow(
      'Unhandled ticket activity type: BOGUS',
    );
  });
});
