import {
  parseAssigneeUpdatedMetadata,
  parseCommentAddedMetadata,
  parseDescriptionUpdatedMetadata,
  parseIncidentLinkedMetadata,
  parsePriorityUpdatedMetadata,
  parseStatusUpdatedMetadata,
  parseTicketOpenedMetadata,
  parseTitleUpdatedMetadata,
} from './parse-metadata';

describe('ticket activity metadata parsers', () => {
  it('parses TICKET_OPENED and treats non-record input as empty', () => {
    expect(parseTicketOpenedMetadata({ priority: 'LOW', status: 'OPEN' })).toEqual({
      priority: 'LOW',
      status: 'OPEN',
    });
    expect(() => parseTicketOpenedMetadata(null)).toThrow('Invalid priority in activity metadata');
  });

  it('parses STATUS_UPDATED', () => {
    expect(parseStatusUpdatedMetadata({ from: 'OPEN', to: 'RESOLVED' })).toEqual({
      from: 'OPEN',
      to: 'RESOLVED',
    });
    expect(() => parseStatusUpdatedMetadata([])).toThrow('Invalid STATUS_UPDATED metadata');
    expect(() => parseStatusUpdatedMetadata({ from: 'OPEN', to: 'NOPE' })).toThrow(
      'Invalid to in activity metadata',
    );
  });

  it('parses PRIORITY_UPDATED', () => {
    expect(parsePriorityUpdatedMetadata({ from: 'LOW', to: 'CRITICAL' })).toEqual({
      from: 'LOW',
      to: 'CRITICAL',
    });
    expect(() => parsePriorityUpdatedMetadata('x')).toThrow('Invalid PRIORITY_UPDATED metadata');
    expect(() => parsePriorityUpdatedMetadata({ from: 'URGENT', to: 'LOW' })).toThrow(
      'Invalid from in activity metadata',
    );
  });

  it('parses ASSIGNEE_UPDATED', () => {
    expect(parseAssigneeUpdatedMetadata({ assignedUserId: null })).toEqual({ assignedUserId: null });
    expect(() => parseAssigneeUpdatedMetadata({ assignedUserId: 1 })).toThrow(
      'Invalid assignedUserId in activity metadata',
    );
    expect(() => parseAssigneeUpdatedMetadata(undefined)).toThrow(
      'Invalid ASSIGNEE_UPDATED metadata',
    );
  });

  it('parses INCIDENT_LINKED', () => {
    expect(parseIncidentLinkedMetadata({ incidentId: 'inc-1' })).toEqual({ incidentId: 'inc-1' });
    expect(parseIncidentLinkedMetadata({ incidentId: null })).toEqual({ incidentId: null });
    expect(() => parseIncidentLinkedMetadata({})).toThrow(
      'Invalid incidentId in activity metadata',
    );
    expect(() => parseIncidentLinkedMetadata(null)).toThrow('Invalid INCIDENT_LINKED metadata');
  });

  it('parses COMMENT_ADDED', () => {
    expect(parseCommentAddedMetadata({ body: 'hi' })).toEqual({ body: 'hi' });
    expect(() => parseCommentAddedMetadata({ body: null })).toThrow();
    expect(() => parseCommentAddedMetadata(null)).toThrow('Invalid COMMENT_ADDED metadata');
  });

  it('parses DESCRIPTION_UPDATED', () => {
    expect(parseDescriptionUpdatedMetadata({ from: 'a', to: null })).toEqual({ from: 'a', to: null });
    expect(() => parseDescriptionUpdatedMetadata({ from: 1, to: null })).toThrow(
      'Invalid from in activity metadata',
    );
    expect(() => parseDescriptionUpdatedMetadata(null)).toThrow(
      'Invalid DESCRIPTION_UPDATED metadata',
    );
  });

  it('parses TITLE_UPDATED', () => {
    expect(parseTitleUpdatedMetadata({ from: 'a', to: 'b' })).toEqual({ from: 'a', to: 'b' });
    expect(() => parseTitleUpdatedMetadata({ from: 'a', to: null })).toThrow(
      'Invalid to in activity metadata',
    );
    expect(() => parseTitleUpdatedMetadata(null)).toThrow('Invalid TITLE_UPDATED metadata');
  });
});
