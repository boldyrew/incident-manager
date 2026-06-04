'use client';

import { IncidentActionsPanel } from '@/components/incidents/incident-detail/IncidentActionsPanel';
import { IncidentActivityPanel } from '@/components/incidents/incident-detail/incident-activity/IncidentActivityPanel';
import { IncidentBackLink } from '@/components/incidents/incident-detail/IncidentBackLink';
import { IncidentCommentForm } from '@/components/incidents/incident-detail/IncidentCommentForm';
import { IncidentDetailsPanel } from '@/components/incidents/incident-detail/IncidentDetailsPanel';
import { IncidentSummaryPanel } from '@/components/incidents/incident-detail/IncidentSummaryPanel';
import { IncidentDetailProvider } from '@/context/incident-context';
import { useIncidentActivities } from '@/hooks/useIncidentActivities';
import { getIncident } from '@/lib/api';
import type { Incident } from '@/types/incident';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function IncidentDetailPage() {
  const params = useParams();
  const incidentId = typeof params.id === 'string' ? params.id : '';

  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState<Incident | null>(null);

  const {
    activities,
    loading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useIncidentActivities(incidentId || undefined);

  const fetchIncident = useCallback(async () => {
    if (!incidentId) return;
    try {
      setLoading(true);
      const data = await getIncident(incidentId);
      setIncident(data);
    } catch (err) {
      console.error('Failed to fetch incident:', err);
      setIncident(null);
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchIncident();
  }, [fetchIncident]);

  if (!incidentId) {
    return <div className="text-muted-foreground">Invalid incident</div>;
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!incident) {
    return <div className="text-muted-foreground">Incident not found</div>;
  }

  return (
    <IncidentDetailProvider
      incidentId={incidentId}
      incident={incident}
      refetch={fetchIncident}
      refetchActivities={refetchActivities}
    >
      <div className="space-y-6">
        <IncidentBackLink />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 space-y-4 lg:max-w-[320px]">
            <IncidentDetailsPanel />
            <IncidentActionsPanel />
          </aside>

          <div className="min-w-0 flex-1 space-y-4">
            <IncidentSummaryPanel />
            <IncidentActivityPanel
              activities={activities}
              loading={activitiesLoading}
              error={activitiesError}
            />
            <IncidentCommentForm />
          </div>
        </div>
      </div>
    </IncidentDetailProvider>
  );
}
