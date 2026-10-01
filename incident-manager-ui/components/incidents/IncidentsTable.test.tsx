import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeIncident } from '@/test-utils/fixtures';
import { IncidentsTable } from './IncidentsTable';

const incidents = [
  makeIncident({ assignedUser: { id: 'u1', fullName: 'Bob Builder', email: 'bob@x.io' } }),
  makeIncident({ id: 'incident-2', code: 'INC-0002', title: 'Malware detected', severity: 'CRITICAL', status: 'RESOLVED' }),
];

const headers = () => screen.getAllByRole('columnheader').map((h) => h.textContent);

describe('IncidentsTable', () => {
  it('renders a row per incident with badges, link and formatted date', () => {
    render(<IncidentsTable incidents={incidents} />);

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);

    const first = within(rows[0]);
    expect(first.getByText('INC-0001')).toBeInTheDocument();
    expect(first.getByRole('link', { name: incidents[0].title })).toHaveAttribute('href', '/incidents/incident-1');
    expect(first.getByText('High')).toBeInTheDocument();
    expect(first.getByText('Open')).toBeInTheDocument();
    expect(first.getByText('Acme Corp')).toBeInTheDocument();
    expect(first.getByText('Bob Builder')).toBeInTheDocument();
    expect(first.getByText('15 Mar 2026, 10:30:00')).toBeInTheDocument();

    expect(within(rows[1]).getByText('Unassigned')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Critical')).toBeInTheDocument();
  });

  it('shows the default columns without actions', () => {
    render(<IncidentsTable incidents={incidents} />);
    expect(headers()).toEqual([
      'Incident ID',
      'Title',
      'Severity',
      'Status',
      'Client',
      'Assigned To',
      'Detected Time',
    ]);
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
  });

  it('adds the actions column when edit and delete handlers are given', () => {
    render(<IncidentsTable incidents={incidents} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(headers()).toContain('Actions');
    expect(screen.getAllByTitle('Edit')).toHaveLength(2);
  });

  it('respects showActions=false and custom column options', () => {
    render(
      <IncidentsTable
        incidents={incidents}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        showActions={false}
        showAssignedTo={false}
        detectedAtLabel="Time"
        formatDetectedAt={() => 'just now'}
      />,
    );
    expect(headers()).toEqual(['Incident ID', 'Title', 'Severity', 'Status', 'Client', 'Time']);
    expect(screen.getAllByText('just now')).toHaveLength(2);
  });

  it('renders skeleton rows while loading', () => {
    const { container } = render(<IncidentsTable incidents={incidents} loading onEdit={jest.fn()} onDelete={jest.fn()} />);
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(5);
    expect(within(rows[0]).getAllByRole('cell')).toHaveLength(8);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(40);
    expect(screen.queryByText('INC-0001')).not.toBeInTheDocument();
  });

  it('renders the empty message spanning all columns', () => {
    render(<IncidentsTable incidents={[]} emptyMessage="Nothing here" />);
    expect(screen.getByRole('cell', { name: 'Nothing here' })).toHaveAttribute('colspan', '7');
  });

  it('calls onEdit with the incident', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    render(<IncidentsTable incidents={incidents} onEdit={onEdit} onDelete={jest.fn()} />);
    await user.click(screen.getAllByTitle('Edit')[1]);
    expect(onEdit).toHaveBeenCalledWith(incidents[1]);
  });

  it('asks for confirmation before deleting', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    render(<IncidentsTable incidents={incidents} onEdit={jest.fn()} onDelete={onDelete} />);

    await user.click(screen.getAllByTitle('Delete')[0]);
    const dialog = screen.getByRole('dialog', { name: 'Delete Incident' });
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith('incident-1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not delete when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    render(<IncidentsTable incidents={incidents} onEdit={jest.fn()} onDelete={onDelete} />);

    await user.click(screen.getAllByTitle('Delete')[0]);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
