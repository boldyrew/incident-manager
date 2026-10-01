import { render } from '@testing-library/react';
import { BarChart } from './BarChart';
import { LinearChart } from './LinearChart';

// recharts' ResponsiveContainer measures its parent, which is 0x0 in jsdom; these are smoke tests.
describe('chart wrappers', () => {
  const data = [
    { day: 'Mon', count: 1 },
    { day: 'Tue', count: 2 },
  ];

  it('renders BarChart without crashing', () => {
    const { container } = render(<BarChart data={data} xDataKey="day" yDataKey="count" height={100} />);
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders LinearChart without crashing', () => {
    const { container } = render(
      <LinearChart data={data} xDataKey="day" yDataKey="count" gradientId="g" height={100} />,
    );
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});
