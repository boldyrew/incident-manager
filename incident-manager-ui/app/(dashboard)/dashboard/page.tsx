'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { AlertTriangle, XCircle, CheckCircle2, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { getDashboardStats, getRecentIncidents } from '@/lib/api';
import { DashboardStats, RecentIncident } from '@/types/dashboard';
import { SeverityBadge } from '@/components/incidents/SeverityBadge';
import { StatusBadge } from '@/components/incidents/StatusBadge';

function StatCard({
  icon,
  iconBg,
  label,
  value,
  trend,
  trendLabel,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  trend: number;
  trendLabel: string;
}) {
  const isUp = trend >= 0;
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>{icon}</div>
        <span
          className={`flex items-center gap-1 text-xs font-medium ${isUp ? 'text-orange-400' : 'text-emerald-400'}`}
        >
          {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isUp ? '+' : ''}
          {trend}%
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

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

  const severityChartData = stats
    ? [
        { name: 'Critical', count: stats.incidentsBySeverity.CRITICAL },
        { name: 'High', count: stats.incidentsBySeverity.HIGH },
        { name: 'Medium', count: stats.incidentsBySeverity.MEDIUM },
        { name: 'Low', count: stats.incidentsBySeverity.LOW },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time security operations overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-orange-400" />}
          iconBg="bg-orange-400/10"
          label="Open Incidents"
          value={stats?.openIncidents ?? 0}
          trend={12}
          trendLabel="vs last week"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5 text-red-400" />}
          iconBg="bg-red-400/10"
          label="Critical Incidents"
          value={stats?.criticalIncidents ?? 0}
          trend={-3}
          trendLabel="vs last week"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
          iconBg="bg-emerald-400/10"
          label="Resolved This Week"
          value={stats?.resolvedThisWeek ?? 0}
          trend={18}
          trendLabel="vs last week"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-yellow-400" />}
          iconBg="bg-yellow-400/10"
          label="SLA Breaches"
          value={stats?.slaBreaches ?? 0}
          trend={-50}
          trendLabel="vs last week"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Incidents by Severity</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={severityChartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                cursor={{ fill: 'hsl(var(--accent))' }}
              />
              <Bar dataKey="count" fill="#6096ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Incidents Over Time (7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.incidentsOverTime ?? []}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6096ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6096ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#6096ff"
                strokeWidth={2}
                fill="url(#colorCount)"
                dot={{ fill: '#6096ff', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">Recent Incidents</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left pb-3 font-medium">ID</th>
              <th className="text-left pb-3 font-medium">Title</th>
              <th className="text-left pb-3 font-medium">Severity</th>
              <th className="text-left pb-3 font-medium">Status</th>
              <th className="text-left pb-3 font-medium">Client</th>
              <th className="text-left pb-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((inc) => (
              <tr key={inc.id} className="border-b border-border/50 last:border-0">
                <td className="py-3 pr-4">
                  <Link
                    href={`/incidents/${inc.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {inc.code}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-foreground max-w-xs truncate">{inc.title}</td>
                <td className="py-3 pr-4">
                  <SeverityBadge severity={inc.severity} />
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={inc.status} />
                </td>
                <td className="py-3 pr-4">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-accent text-foreground">
                    {inc.tenant?.name ?? inc.client}
                  </span>
                </td>
                <td className="py-3 text-muted-foreground whitespace-nowrap">
                  {timeAgo(inc.detectedAt)}
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No incidents yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
