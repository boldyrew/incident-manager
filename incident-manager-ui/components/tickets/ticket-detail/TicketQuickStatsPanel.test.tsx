import { act, screen } from '@testing-library/react';
import { makeTicket, makeTicketActivity } from '@/test-utils/fixtures';
import { renderWithTicket } from '@/test-utils/render';
import { TicketQuickStatsPanel } from './TicketQuickStatsPanel';

const value = (label: string) => screen.getByText(label).nextElementSibling?.textContent;

describe('TicketQuickStatsPanel', () => {
  beforeEach(() => jest.useFakeTimers().setSystemTime(new Date('2026-03-15T12:30:00.000Z')));
  afterEach(() => jest.useRealTimers());

  it('shows a loading state', () => {
    renderWithTicket(<TicketQuickStatsPanel activities={[]} loading />);
    expect(screen.getByText('Loading stats…')).toBeInTheDocument();
  });

  it('shows time open, comments and status changes', () => {
    renderWithTicket(
      <TicketQuickStatsPanel
        activities={[
          makeTicketActivity('COMMENT_ADDED', { body: 'a' }, { id: 'c1' }),
          makeTicketActivity('STATUS_UPDATED', { from: 'OPEN', to: 'IN_PROGRESS' }, { id: 's1' }),
        ]}
      />,
    );
    expect(value('Time Open')).toBe('2h 30m');
    expect(value('Comments')).toBe('1');
    expect(value('Status Changes')).toBe('1');
  });

  it('ticks every minute while the ticket is open', () => {
    renderWithTicket(<TicketQuickStatsPanel activities={[]} />);
    expect(value('Time Open')).toBe('2h 30m');
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(value('Time Open')).toBe('2h 31m');
  });

  it('does not tick for closed tickets', () => {
    renderWithTicket(<TicketQuickStatsPanel activities={[]} />, {
      entity: makeTicket({ status: 'CLOSED' }),
    });
    const before = value('Time Open');
    act(() => {
      jest.advanceTimersByTime(5 * 60_000);
    });
    expect(value('Time Open')).toBe(before);
  });
});
