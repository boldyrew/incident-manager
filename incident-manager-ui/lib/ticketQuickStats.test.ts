import { makeTicketActivity } from '@/test-utils/fixtures';
import { formatTimeOpen, getTicketQuickStats, getTimeOpenMs } from './ticketQuickStats';

const CREATED = '2026-03-15T10:00:00.000Z';
const NOW = new Date('2026-03-15T12:30:00.000Z');

const statusChange = (to: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED', at: string) =>
  makeTicketActivity('STATUS_UPDATED', { from: 'OPEN', to }, { id: `s-${at}`, createdAt: at });

describe('ticketQuickStats', () => {
  it('measures an open ticket against now', () => {
    expect(getTimeOpenMs(CREATED, 'OPEN', [], NOW)).toBe(2.5 * 60 * 60 * 1000);
    expect(formatTimeOpen(CREATED, 'IN_PROGRESS', [], NOW)).toBe('2h 30m');
  });

  it('stops the clock at the latest terminal status change for closed tickets', () => {
    const activities = [
      statusChange('RESOLVED', '2026-03-15T11:00:00.000Z'),
      statusChange('IN_PROGRESS', '2026-03-15T11:30:00.000Z'),
      statusChange('CLOSED', '2026-03-15T11:45:00.000Z'),
    ];
    expect(formatTimeOpen(CREATED, 'CLOSED', activities, NOW)).toBe('1h 45m');
  });

  it('ignores terminal status changes while the ticket is open again', () => {
    const activities = [statusChange('RESOLVED', '2026-03-15T11:00:00.000Z')];
    expect(formatTimeOpen(CREATED, 'OPEN', activities, NOW)).toBe('2h 30m');
  });

  it('falls back to now when a resolved ticket has no status history', () => {
    expect(formatTimeOpen(CREATED, 'RESOLVED', [], NOW)).toBe('2h 30m');
  });

  it('counts comments and status changes', () => {
    const activities = [
      makeTicketActivity('COMMENT_ADDED', { body: 'a' }, { id: 'c1' }),
      makeTicketActivity('COMMENT_ADDED', { body: 'b' }, { id: 'c2' }),
      statusChange('IN_PROGRESS', '2026-03-15T11:00:00.000Z'),
      makeTicketActivity('TITLE_UPDATED', { from: 'a', to: 'b' }),
    ];
    expect(getTicketQuickStats(CREATED, 'IN_PROGRESS', activities, NOW)).toEqual({
      timeOpen: '2h 30m',
      comments: 2,
      statusChanges: 1,
    });
  });

  it('defaults now to the current time', () => {
    jest.useFakeTimers().setSystemTime(NOW);
    expect(getTicketQuickStats(CREATED, 'OPEN', []).timeOpen).toBe('2h 30m');
    jest.useRealTimers();
  });
});
