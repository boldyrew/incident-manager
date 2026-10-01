import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assignIncident, getAnalysts } from '@/lib/api';
import { makeAnalyst, makeIncident } from '@/test-utils/fixtures';
import { renderWithIncident } from '@/test-utils/render';
import { chooseOption } from '@/test-utils/select';
import { IncidentReassignDialog } from './IncidentReassignDialog';

jest.mock('@/lib/api', () => ({
  getAnalysts: jest.fn(),
  assignIncident: jest.fn(),
}));

const analysts = [makeAnalyst(), makeAnalyst({ id: 'analyst-2', fullName: 'Carol Danvers', email: 'carol@x.io' })];

describe('IncidentReassignDialog', () => {
  beforeEach(() => {
    (getAnalysts as jest.Mock).mockReset().mockResolvedValue(analysts);
    (assignIncident as jest.Mock).mockReset().mockResolvedValue(undefined);
  });

  it('does not load analysts while closed', () => {
    renderWithIncident(<IncidentReassignDialog open={false} onOpenChange={jest.fn()} />);
    expect(getAnalysts).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('preselects the current assignee', async () => {
    const user = userEvent.setup();
    renderWithIncident(<IncidentReassignDialog open onOpenChange={jest.fn()} />, {
      entity: makeIncident({ assignedUser: analysts[1] }),
    });
    await waitFor(() => expect(getAnalysts).toHaveBeenCalled());

    // NOTE: UserSelect items have no SelectPrimitive.ItemText, so the trigger stays blank
    // even though a value is selected. The selection is only visible in the open list.
    expect(screen.getByRole('combobox')).toHaveTextContent('');

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: /Carol Danvers/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('assigns the chosen analyst, refreshes and closes', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    const { refetch, refetchActivities } = renderWithIncident(
      <IncidentReassignDialog open onOpenChange={onOpenChange} />,
    );

    await waitFor(() => expect(getAnalysts).toHaveBeenCalled());
    await chooseOption(user, screen.getByRole('combobox'), /Bob Builder/);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(assignIncident).toHaveBeenCalledWith('incident-1', 'analyst-1');
    expect(refetch).toHaveBeenCalled();
    expect(refetchActivities).toHaveBeenCalled();
  });

  it('clears the assignment when Unassigned is chosen', async () => {
    const user = userEvent.setup();
    renderWithIncident(<IncidentReassignDialog open onOpenChange={jest.fn()} />, {
      entity: makeIncident({ assignedUser: analysts[0] }),
    });

    await waitFor(() => expect(getAnalysts).toHaveBeenCalled());
    await chooseOption(user, screen.getByRole('combobox'), /Unassigned/);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(assignIncident).toHaveBeenCalledWith('incident-1', null));
  });

  it('closes without saving on Cancel', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderWithIncident(<IncidentReassignDialog open onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(assignIncident).not.toHaveBeenCalled();
  });
});
