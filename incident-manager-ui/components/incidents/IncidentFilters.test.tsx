import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { chooseOption } from '@/test-utils/select';
import { IncidentFilters } from './IncidentFilters';

function setup(severity: 'ALL' | 'HIGH' = 'ALL', status: 'ALL' | 'OPEN' = 'ALL') {
  const onSeverityChange = jest.fn();
  const onStatusChange = jest.fn();
  render(
    <IncidentFilters
      severity={severity}
      status={status}
      onSeverityChange={onSeverityChange}
      onStatusChange={onStatusChange}
    />,
  );
  const [severityTrigger, statusTrigger] = screen.getAllByRole('combobox');
  return { onSeverityChange, onStatusChange, severityTrigger, statusTrigger, user: userEvent.setup() };
}

describe('IncidentFilters', () => {
  it('shows the current selections', () => {
    const { severityTrigger, statusTrigger } = setup('HIGH', 'OPEN');
    expect(severityTrigger).toHaveTextContent('High');
    expect(statusTrigger).toHaveTextContent('Open');
  });

  it('reports a severity change', async () => {
    const { user, severityTrigger, onSeverityChange } = setup();
    await chooseOption(user, severityTrigger, 'Critical');
    expect(onSeverityChange).toHaveBeenCalledWith('CRITICAL');
  });

  it('reports a status change', async () => {
    const { user, statusTrigger, onStatusChange } = setup();
    await chooseOption(user, statusTrigger, 'In Progress');
    expect(onStatusChange).toHaveBeenCalledWith('IN_PROGRESS');
  });

  it('hides "Clear filters" when nothing is filtered', () => {
    setup();
    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();
  });

  it.each([
    ['HIGH', 'ALL'],
    ['ALL', 'OPEN'],
  ] as const)('clears both filters (severity=%s, status=%s)', async (severity, status) => {
    const { user, onSeverityChange, onStatusChange } = setup(severity, status);
    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(onSeverityChange).toHaveBeenCalledWith('ALL');
    expect(onStatusChange).toHaveBeenCalledWith('ALL');
  });
});
