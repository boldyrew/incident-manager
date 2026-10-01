import {
  parseAssigneeUpdatedMetadata,
  parseCommentAddedMetadata,
  parseDescriptionUpdatedMetadata,
  parseIncidentOpenedMetadata,
  parseSeverityUpdatedMetadata,
  parseStatusUpdatedMetadata,
  parseTitleUpdatedMetadata,
} from './parse-metadata';

describe('incident activity metadata parsers', () => {
  describe('parseIncidentOpenedMetadata', () => {
    it('parses valid metadata', () => {
      expect(parseIncidentOpenedMetadata({ severity: 'LOW', status: 'OPEN' })).toEqual({
        severity: 'LOW',
        status: 'OPEN',
      });
    });

    it('treats non-record input as empty and fails on severity', () => {
      expect(() => parseIncidentOpenedMetadata('nope')).toThrow(
        'Invalid severity in activity metadata',
      );
    });

    it('rejects unknown enum values', () => {
      expect(() => parseIncidentOpenedMetadata({ severity: 'LOW', status: 'DONE' })).toThrow(
        'Invalid status in activity metadata',
      );
    });
  });

  describe('parseStatusUpdatedMetadata', () => {
    it('parses valid metadata', () => {
      expect(parseStatusUpdatedMetadata({ from: 'OPEN', to: 'CLOSED' })).toEqual({
        from: 'OPEN',
        to: 'CLOSED',
      });
    });

    it.each([null, [], 'x', 1])('rejects non-record input %p', (raw) => {
      expect(() => parseStatusUpdatedMetadata(raw)).toThrow('Invalid STATUS_UPDATED metadata');
    });

    it('rejects a severity value used as status', () => {
      expect(() => parseStatusUpdatedMetadata({ from: 'OPEN', to: 'HIGH' })).toThrow(
        'Invalid to in activity metadata',
      );
    });
  });

  describe('parseSeverityUpdatedMetadata', () => {
    it('parses valid metadata', () => {
      expect(parseSeverityUpdatedMetadata({ from: 'LOW', to: 'CRITICAL' })).toEqual({
        from: 'LOW',
        to: 'CRITICAL',
      });
    });

    it('rejects invalid input', () => {
      expect(() => parseSeverityUpdatedMetadata(undefined)).toThrow(
        'Invalid SEVERITY_UPDATED metadata',
      );
      expect(() => parseSeverityUpdatedMetadata({ from: 1, to: 'LOW' })).toThrow(
        'Invalid from in activity metadata',
      );
    });
  });

  describe('parseAssigneeUpdatedMetadata', () => {
    it('accepts a user id or null', () => {
      expect(parseAssigneeUpdatedMetadata({ assignedUserId: 'u-1' })).toEqual({
        assignedUserId: 'u-1',
      });
      expect(parseAssigneeUpdatedMetadata({ assignedUserId: null })).toEqual({
        assignedUserId: null,
      });
    });

    it('rejects a missing or non-string id', () => {
      expect(() => parseAssigneeUpdatedMetadata({})).toThrow(
        'Invalid assignedUserId in activity metadata',
      );
      expect(() => parseAssigneeUpdatedMetadata({ assignedUserId: 5 })).toThrow();
      expect(() => parseAssigneeUpdatedMetadata(null)).toThrow('Invalid ASSIGNEE_UPDATED metadata');
    });
  });

  describe('parseCommentAddedMetadata', () => {
    it('parses a body', () => {
      expect(parseCommentAddedMetadata({ body: 'hi' })).toEqual({ body: 'hi' });
    });

    it('rejects a null body', () => {
      expect(() => parseCommentAddedMetadata({ body: null })).toThrow(
        'Invalid body in activity metadata',
      );
      expect(() => parseCommentAddedMetadata([])).toThrow('Invalid COMMENT_ADDED metadata');
    });
  });

  describe('parseDescriptionUpdatedMetadata', () => {
    it('accepts nullable strings', () => {
      expect(parseDescriptionUpdatedMetadata({ from: null, to: 'x' })).toEqual({
        from: null,
        to: 'x',
      });
    });

    it('rejects undefined fields', () => {
      expect(() => parseDescriptionUpdatedMetadata({ from: null })).toThrow(
        'Invalid to in activity metadata',
      );
      expect(() => parseDescriptionUpdatedMetadata('x')).toThrow(
        'Invalid DESCRIPTION_UPDATED metadata',
      );
    });
  });

  describe('parseTitleUpdatedMetadata', () => {
    it('parses required strings', () => {
      expect(parseTitleUpdatedMetadata({ from: 'a', to: 'b' })).toEqual({ from: 'a', to: 'b' });
    });

    it('rejects null fields', () => {
      expect(() => parseTitleUpdatedMetadata({ from: null, to: 'b' })).toThrow(
        'Invalid from in activity metadata',
      );
      expect(() => parseTitleUpdatedMetadata(null)).toThrow('Invalid TITLE_UPDATED metadata');
    });
  });
});
