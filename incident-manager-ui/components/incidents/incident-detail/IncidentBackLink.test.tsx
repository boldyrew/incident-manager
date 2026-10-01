import { render, screen } from '@testing-library/react';
import { IncidentBackLink } from './IncidentBackLink';

describe('IncidentBackLink', () => {
  it('links back to the incidents list', () => {
    render(<IncidentBackLink />);
    expect(screen.getByRole('link', { name: 'Back to incidents' })).toHaveAttribute('href', '/incidents');
  });
});
