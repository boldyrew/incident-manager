import { render, screen } from '@testing-library/react';
import { makeTicketActivity } from '@/test-utils/fixtures';
import { TicketActivityItem } from './TicketActivityItem';
import { TicketActivityItemDescription } from './TicketActivityItemDescription';
import { TicketActivityPanel } from './TicketActivityPanel';

describe('TicketActivityItemDescription', () => {
  beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('prefers plainData from the server', () => {
    render(
      <TicketActivityItemDescription
        activity={makeTicketActivity('COMMENT_ADDED', { body: 'x' }, { plainData: 'Server text' })}
      />,
    );
    expect(screen.getByText(/Server text/)).toBeInTheDocument();
  });

  it.each([
    [makeTicketActivity('TICKET_OPENED', { priority: 'LOW', status: 'OPEN' }), 'Ticket opened'],
    [makeTicketActivity('STATUS_UPDATED', { from: 'OPEN', to: 'CLOSED' }), 'Status changed from OPEN to CLOSED'],
    [makeTicketActivity('PRIORITY_UPDATED', { from: 'LOW', to: 'HIGH' }), 'Priority changed from LOW to HIGH'],
    [makeTicketActivity('INCIDENT_LINKED', { fromIncidentId: null, toIncidentId: 'i1' }), 'Incident link updated'],
    [makeTicketActivity('COMMENT_ADDED', { body: 'x' }), 'Comment added'],
    [makeTicketActivity('DESCRIPTION_UPDATED', { from: null, to: 'x' }), 'Description updated'],
    [makeTicketActivity('TITLE_UPDATED', { from: 'a', to: 'b' }), 'Title changed from "a" to "b"'],
    [makeTicketActivity('BOGUS' as never, {} as never), 'Activity recorded'],
  ])('falls back to a generated description (%#)', (activity, text) => {
    render(<TicketActivityItemDescription activity={activity} />);
    expect(screen.getByText(`• ${text}`)).toBeInTheDocument();
  });

  it('describes assignment changes', () => {
    const { rerender } = render(
      <TicketActivityItemDescription
        activity={makeTicketActivity('ASSIGNEE_UPDATED', {
          assignedUserId: 'u1',
          assignedUser: { id: 'u1', fullName: 'Bob Builder', email: 'bob@x.io' },
        })}
      />,
    );
    expect(screen.getByText('Bob Builder')).toBeInTheDocument();

    rerender(
      <TicketActivityItemDescription
        activity={makeTicketActivity('ASSIGNEE_UPDATED', { assignedUserId: null, assignedUser: null })}
      />,
    );
    expect(screen.getByText(/Removed assignee/)).toBeInTheDocument();
  });

  // NOTE: leftover debug logging — every activity without plainData is printed to the console.
  it('logs the activity to the console', () => {
    const activity = makeTicketActivity('TICKET_OPENED', { priority: 'LOW', status: 'OPEN' });
    render(<TicketActivityItemDescription activity={activity} />);
    expect(console.log).toHaveBeenCalledWith(activity);
  });
});

describe('TicketActivityItem', () => {
  beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('shows actor, time and comment body', () => {
    render(
      <ul>
        <TicketActivityItem activity={makeTicketActivity('COMMENT_ADDED', { body: 'Keys rotated' })} />
      </ul>,
    );
    expect(screen.getByText('Jane Analyst')).toBeInTheDocument();
    expect(screen.getByText('15 Mar 2026, 12:00')).toBeInTheDocument();
    expect(screen.getByText('Keys rotated')).toBeInTheDocument();
  });

  it.each(['TICKET_OPENED', 'PRIORITY_UPDATED', 'ASSIGNEE_UPDATED', 'INCIDENT_LINKED'] as const)(
    'renders an icon for %s',
    (type) => {
      const { container } = render(
        <ul>
          <TicketActivityItem activity={makeTicketActivity(type, {} as never, { actor: null })} />
        </ul>,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    },
  );
});

describe('TicketActivityPanel', () => {
  beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('shows loading, error, empty and list states', () => {
    const { rerender } = render(<TicketActivityPanel activities={[]} loading />);
    expect(screen.getByText('Loading activity…')).toBeInTheDocument();
    rerender(<TicketActivityPanel activities={[]} error="Failed to load activity" />);
    expect(screen.getByText('Failed to load activity')).toBeInTheDocument();
    rerender(<TicketActivityPanel activities={[]} />);
    expect(screen.getByText('No activity yet.')).toBeInTheDocument();
    rerender(<TicketActivityPanel activities={[makeTicketActivity('COMMENT_ADDED', { body: 'a' })]} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });
});
