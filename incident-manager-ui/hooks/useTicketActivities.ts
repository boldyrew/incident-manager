'use client';

import { getTicketActivities } from '@/lib/api';
import type { TicketActivity } from '@/types/ticket-activity';
import { useCallback, useEffect, useState } from 'react';

export function useTicketActivities(ticketId: string | undefined) {
  const [activities, setActivities] = useState<TicketActivity[]>([]);
  const [loading, setLoading] = useState(Boolean(ticketId));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!ticketId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getTicketActivities(ticketId);
      setActivities(data);
    } catch (err) {
      console.error('Failed to fetch ticket activities:', err);
      setError('Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { activities, loading, error, refetch };
}
