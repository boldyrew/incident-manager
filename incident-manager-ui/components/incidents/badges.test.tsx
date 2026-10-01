import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';

describe('SeverityBadge', () => {
  it.each([
    ['CRITICAL', 'Critical', 'text-red-400'],
    ['HIGH', 'High', 'text-orange-400'],
    ['MEDIUM', 'Medium', 'text-yellow-400'],
    ['LOW', 'Low', 'text-blue-400'],
  ] as const)('renders %s', (severity, label, colour) => {
    render(<SeverityBadge severity={severity} />);
    expect(screen.getByText(label)).toHaveClass(colour);
  });
});

describe('StatusBadge', () => {
  it.each([
    ['OPEN', 'Open', 'text-red-400'],
    ['IN_PROGRESS', 'In Progress', 'text-yellow-400'],
    ['RESOLVED', 'Resolved', 'text-green-400'],
    ['CLOSED', 'Closed', 'text-slate-400'],
  ] as const)('renders %s', (status, label, colour) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toHaveClass(colour);
  });
});

describe('Badge', () => {
  it('applies the variant and custom classes', () => {
    render(<Badge variant="success" label="Done" className="extra" />);
    expect(screen.getByText('Done')).toHaveClass('text-green-400', 'extra');
  });
});
