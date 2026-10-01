import { renderHook } from '@testing-library/react';
import { useFormatDateTime } from './useFormatDateTime';

describe('useFormatDateTime', () => {
  it('formats dates as "DD Mon YYYY, HH:mm" in 24h time', () => {
    const { result } = renderHook(() => useFormatDateTime());
    expect(result.current.formatDateTime('2026-03-15T18:05:00.000Z')).toBe('15 Mar 2026, 18:05');
    expect(result.current.formatDateTime(new Date('2026-01-02T03:04:00.000Z'))).toBe(
      '02 Jan 2026, 03:04',
    );
  });
});
