'use client';

import { getIncidentActivities } from '@/lib/api';
import type { IncidentActivity } from '@/types/incident-activity';
import { useCallback, useEffect, useState } from 'react';

export function useIncidentActivities(incidentId: string | undefined) {
  const [activities, setActivities] = useState<IncidentActivity[]>([]);
  const [loading, setLoading] = useState(Boolean(incidentId));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!incidentId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getIncidentActivities(incidentId);
      setActivities(data);
    } catch (err) {
      console.error('Failed to fetch incident activities:', err);
      setError('Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { activities, loading, error, refetch };
}
