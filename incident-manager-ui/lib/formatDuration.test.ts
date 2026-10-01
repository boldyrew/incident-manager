import { formatDuration } from './formatDuration';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe('formatDuration', () => {
  it.each([
    [0, '< 1m'],
    [59_999, '< 1m'],
    [-5 * MIN, '< 1m'],
    [5 * MIN, '5m'],
    [2 * HOUR, '2h'],
    [2 * HOUR + 15 * MIN, '2h 15m'],
    [DAY, '1d'],
    [3 * DAY + 4 * HOUR + 30 * MIN, '3d 4h'],
    [2 * DAY + 10 * MIN, '2d'],
  ])('formats %d ms as %p', (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });
});
