import { act, renderHook, waitFor } from '@testing-library/react';
import { getIncidentActivities, getTicketActivities } from '@/lib/api';
import { makeIncidentActivity } from '@/test-utils/fixtures';
import { useIncidentActivities } from './useIncidentActivities';
import { useTicketActivities } from './useTicketActivities';

jest.mock('@/lib/api', () => ({
  getIncidentActivities: jest.fn(),
  getTicketActivities: jest.fn(),
}));

const cases = [
  ['useIncidentActivities', useIncidentActivities, getIncidentActivities as jest.Mock],
  ['useTicketActivities', useTicketActivities, getTicketActivities as jest.Mock],
] as const;

describe.each(cases)('%s', (_name, useActivities, fetcher) => {
  beforeEach(() => {
    fetcher.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('does not fetch without an id', async () => {
    const { result } = renderHook(() => useActivities(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activities).toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('loads activities for the id', async () => {
    const activities = [makeIncidentActivity('COMMENT_ADDED', { body: 'hi' })];
    fetcher.mockResolvedValue(activities);

    const { result } = renderHook(() => useActivities('id-1'));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetcher).toHaveBeenCalledWith('id-1');
    expect(result.current.activities).toBe(activities);
    expect(result.current.error).toBeNull();
  });

  it('exposes an error message when loading fails', async () => {
    fetcher.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useActivities('id-1'));
    await waitFor(() => expect(result.current.error).toBe('Failed to load activity'));
    expect(result.current.loading).toBe(false);
  });

  it('refetch reloads and clears a previous error', async () => {
    fetcher.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce([]);
    const { result } = renderHook(() => useActivities('id-1'));
    await waitFor(() => expect(result.current.error).not.toBeNull());

    await act(() => result.current.refetch());

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
  });

  it('refetches when the id changes', async () => {
    fetcher.mockResolvedValue([]);
    const { rerender } = renderHook(({ id }) => useActivities(id), { initialProps: { id: 'a' } });
    await waitFor(() => expect(fetcher).toHaveBeenCalledWith('a'));
    rerender({ id: 'b' });
    await waitFor(() => expect(fetcher).toHaveBeenCalledWith('b'));
  });
});
