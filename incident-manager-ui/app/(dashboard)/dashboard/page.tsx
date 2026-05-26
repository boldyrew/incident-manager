'use client';

import { useEffect, useState } from 'react';
import { DashboardStatsCards } from '@/components/dashboard/DashboardStatsCards';
import { IncidentsBySeverityChart } from '@/components/dashboard/IncidentsBySeverityChart';
import { IncidentsOverTimeChart } from '@/components/dashboard/IncidentsOverTimeChart';
import { RecentIncidentsTable } from '@/components/dashboard/RecentIncidentsTable';
import PageTitle from '@/components/layout/PageTitle';
import { getDashboardStats, getRecentIncidents } from '@/lib/api';
import { DashboardStats, RecentIncident } from '@/types/dashboard';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getRecentIncidents()])
      .then(([s, r]) => {
        setStats(s);
        setRecent(r);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <PageTitle title="Dashboard" subtitle="Real-time security operations overview" />
      <DashboardStatsCards stats={stats} />

      <div className="grid grid-cols-2 gap-4">
        <IncidentsBySeverityChart stats={stats} />
        <IncidentsOverTimeChart stats={stats} />
      </div>

      <RecentIncidentsTable incidents={recent} />
    </div>
  );
}
