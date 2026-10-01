import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getIncidents, linkIncident } from '@/lib/api';
import { makeIncident, makeTicket } from '@/test-utils/fixtures';
import { renderWithTicket } from '@/test-utils/render';
import { chooseOption } from '@/test-utils/select';
import { TicketLinkIncidentDialog } from './TicketLinkIncidentDialog';

jest.mock('@/lib/api', () => ({ getIncidents: jest.fn(), linkIncident: jest.fn() }));

describe('TicketLinkIncidentDialog', () => {
  beforeEach(() => {
    (getIncidents as jest.Mock).mockReset().mockResolvedValue([makeIncident()]);
    (linkIncident as jest.Mock).mockReset().mockResolvedValue(undefined);
  });

  it("loads incidents for the ticket's tenant", async () => {
    renderWithTicket(<TicketLinkIncidentDialog open onOpenChange={jest.fn()} />);
    await waitFor(() => expect(getIncidents).toHaveBeenCalledWith({ tenantId: 'tenant-1' }));
  });

  it('loads all incidents for a ticket without a tenant', async () => {
    renderWithTicket(<TicketLinkIncidentDialog open onOpenChange={jest.fn()} />, {
      entity: makeTicket({ tenant: null }),
    });
    await waitFor(() => expect(getIncidents).toHaveBeenCalledWith({ tenantId: undefined }));
  });

  it('requires a selection before linking', async () => {
    renderWithTicket(<TicketLinkIncidentDialog open onOpenChange={jest.fn()} />);
    await waitFor(() => expect(getIncidents).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Link' })).toBeDisabled();
  });

  it('links the chosen incident, refreshes and closes', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    const { refetch, refetchActivities } = renderWithTicket(
      <TicketLinkIncidentDialog open onOpenChange={onOpenChange} />,
    );

    await waitFor(() => expect(getIncidents).toHaveBeenCalled());
    await chooseOption(user, screen.getByRole('combobox', { name: 'Incident' }), /INC-0001/);
    await user.click(screen.getByRole('button', { name: 'Link' }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(linkIncident).toHaveBeenCalledWith('ticket-1', 'incident-1');
    expect(refetch).toHaveBeenCalled();
    expect(refetchActivities).toHaveBeenCalled();
  });

  it('closes on Cancel', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderWithTicket(<TicketLinkIncidentDialog open onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
