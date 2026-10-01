import { render, screen } from '@testing-library/react';
import { makeIncidentActivity } from '@/test-utils/fixtures';
import { IncidentActivityItemDescription } from './IncidentActivityItemDescription';
import { IncidentActivityItem } from './IncidentActivityItem';
import { IncidentActivityPanel } from './IncidentActivityPanel';

describe('IncidentActivityItemDescription', () => {
  it('prefers plainData from the server', () => {
    render(
      <IncidentActivityItemDescription
        activity={makeIncidentActivity('STATUS_UPDATED', { from: 'OPEN', to: 'CLOSED' }, { plainData: 'Server text' })}
      />,
    );
    expect(screen.getByText(/Server text/)).toBeInTheDocument();
  });

  it.each([
    [makeIncidentActivity('INCIDENT_OPENED', { severity: 'LOW', status: 'OPEN' }), 'Incident opened'],
    [makeIncidentActivity('STATUS_UPDATED', { from: 'OPEN', to: 'CLOSED' }), 'Status changed from OPEN to CLOSED'],
    [makeIncidentActivity('SEVERITY_UPDATED', { from: 'LOW', to: 'HIGH' }), 'Severity changed from LOW to HIGH'],
    [makeIncidentActivity('COMMENT_ADDED', { body: 'x' }), 'Comment added'],
    [makeIncidentActivity('DESCRIPTION_UPDATED', { from: null, to: 'x' }), 'Description updated'],
    [makeIncidentActivity('TITLE_UPDATED', { from: 'a', to: 'b' }), 'Title changed from "a" to "b"'],
    [makeIncidentActivity('BOGUS' as never, {} as never), 'Activity recorded'],
  ])('falls back to a generated description (%#)', (activity, text) => {
    render(<IncidentActivityItemDescription activity={activity} />);
    expect(screen.getByText(`• ${text}`)).toBeInTheDocument();
  });

  it('describes assignment changes', () => {
    const user = { id: 'u1', fullName: 'Bob Builder', email: 'bob@x.io' };
    const { rerender } = render(
      <IncidentActivityItemDescription
        activity={makeIncidentActivity('ASSIGNEE_UPDATED', { assignedUserId: 'u1', assignedUser: user })}
      />,
    );
    expect(screen.getByText(/Updated assignee to/)).toBeInTheDocument();
    expect(screen.getByText('Bob Builder')).toBeInTheDocument();

    rerender(
      <IncidentActivityItemDescription
        activity={makeIncidentActivity('ASSIGNEE_UPDATED', { assignedUserId: null, assignedUser: null })}
      />,
    );
    expect(screen.getByText(/Removed assignee/)).toBeInTheDocument();
  });
});

describe('IncidentActivityItem', () => {
  it('shows actor, description, time and comment body', () => {
    render(
      <ul>
        <IncidentActivityItem activity={makeIncidentActivity('COMMENT_ADDED', { body: 'Blocked the IP' })} />
      </ul>,
    );
    expect(screen.getByText('Jane Analyst')).toBeInTheDocument();
    expect(screen.getByText(/Comment added/)).toBeInTheDocument();
    expect(screen.getByText('15 Mar 2026, 12:00')).toBeInTheDocument();
    expect(screen.getByText('Blocked the IP')).toBeInTheDocument();
  });

  it('shows System for activities without an actor', () => {
    render(
      <ul>
        <IncidentActivityItem
          activity={makeIncidentActivity('INCIDENT_OPENED', { severity: 'LOW', status: 'OPEN' }, { actor: null })}
        />
      </ul>,
    );
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it.each(['STATUS_UPDATED', 'ASSIGNEE_UPDATED', 'TITLE_UPDATED', 'INCIDENT_OPENED'] as const)(
    'renders an icon for %s',
    (type) => {
      const { container } = render(
        <ul>
          <IncidentActivityItem activity={makeIncidentActivity(type, { from: 'a', to: 'b' } as never)} />
        </ul>,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    },
  );
});

describe('IncidentActivityPanel', () => {
  it('shows loading, error and empty states', () => {
    const { rerender } = render(<IncidentActivityPanel activities={[]} loading />);
    expect(screen.getByText('Loading activity…')).toBeInTheDocument();

    rerender(<IncidentActivityPanel activities={[]} error="Failed to load activity" />);
    expect(screen.getByText('Failed to load activity')).toBeInTheDocument();

    rerender(<IncidentActivityPanel activities={[]} />);
    expect(screen.getByText('No activity yet.')).toBeInTheDocument();
  });

  it('lists activities', () => {
    render(
      <IncidentActivityPanel
        activities={[
          makeIncidentActivity('COMMENT_ADDED', { body: 'a' }, { id: '1' }),
          makeIncidentActivity('TITLE_UPDATED', { from: 'x', to: 'y' }, { id: '2' }),
        ]}
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
