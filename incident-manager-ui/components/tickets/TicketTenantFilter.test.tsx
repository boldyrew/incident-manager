import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketTenantFilter } from './TicketTenantFilter';

const tenants = [
  { id: 't1', name: 'Acme Corp', alias: 'acme' },
  { id: 't2', name: 'Globex', alias: 'globex' },
  { id: 't3', name: 'Initech', alias: 'initech' },
];

function setup(selectedIds: string[] = []) {
  const onChange = jest.fn();
  const utils = render(<TicketTenantFilter tenants={tenants} selectedIds={selectedIds} onChange={onChange} />);
  return { ...utils, onChange, user: userEvent.setup() };
}

describe('TicketTenantFilter', () => {
  it('renders nothing without tenants', () => {
    const { container } = render(<TicketTenantFilter tenants={[]} selectedIds={[]} onChange={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    [[], 'Tenants: All tenants'],
    [['t2'], 'Tenants: Globex'],
    [['missing'], 'Tenants: 1 tenant'],
    [['t1', 't3'], 'Tenants: 2 tenants'],
  ])('summarises the selection %p', (selected, label) => {
    setup(selected);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('adds a tenant when checked', async () => {
    const { user, onChange } = setup(['t1']);
    await user.click(screen.getByRole('checkbox', { name: /Globex/ }));
    expect(onChange).toHaveBeenCalledWith(['t1', 't2']);
  });

  it('removes a tenant when unchecked', async () => {
    const { user, onChange } = setup(['t1', 't2']);
    expect(screen.getByRole('checkbox', { name: /Acme Corp/ })).toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: /Acme Corp/ }));
    expect(onChange).toHaveBeenCalledWith(['t2']);
  });

  it('clears the selection', async () => {
    const { user, onChange } = setup(['t1']);
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('hides Clear selection when nothing is selected', () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
  });
});
