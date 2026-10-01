import { screen } from '@testing-library/react';
import { getIncident, getIncidentActivities } from '@/lib/api';
import { makeIncident, makeIncidentActivity } from '@/test-utils/fixtures';
import { navigationState, resetNavigation } from '@/test-utils/navigation';
import { renderWithAuth } from '@/test-utils/render';
import IncidentDetailPage from './page';

jest.mock('next/navigation', () => require('@/test-utils/navigation').navigationMock);
jest.mock('@/lib/api', () => ({
  getIncident: jest.fn(),
  getIncidentActivities: jest.fn(),
}));

describe('IncidentDetailPage', () => {
  beforeEach(() => {
    resetNavigation();
    navigationState.params = { id: 'incident-1' };
    (getIncident as jest.Mock).mockReset().mockResolvedValue(makeIncident());
    (getIncidentActivities as jest.Mock)
      .mockReset()
      .mockResolvedValue([makeIncidentActivity('COMMENT_ADDED', { body: 'Blocked the IP' })]);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('rejects a missing id', () => {
    navigationState.params = {};
    renderWithAuth(<IncidentDetailPage />, null);
    expect(screen.getByText('Invalid incident')).toBeInTheDocument();
    expect(getIncident).not.toHaveBeenCalled();
  });

  it('shows a loading state, then the incident with its activity', async () => {
    renderWithAuth(<IncidentDetailPage />, null);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    expect(await screen.findByText('Incident Details')).toBeInTheDocument();
    expect(getIncident).toHaveBeenCalledWith('incident-1');
    expect(getIncidentActivities).toHaveBeenCalledWith('incident-1');
    expect(screen.getByRole('link', { name: 'Back to incidents' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Title' })).toHaveTextContent(makeIncident().title);
    expect(await screen.findByText('Blocked the IP')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Add Comment' })).toBeInTheDocument();
  });

  it('shows not found when loading fails', async () => {
    (getIncident as jest.Mock).mockRejectedValue(new Error('404'));
    renderWithAuth(<IncidentDetailPage />, null);
    expect(await screen.findByText('Incident not found')).toBeInTheDocument();
  });
});
