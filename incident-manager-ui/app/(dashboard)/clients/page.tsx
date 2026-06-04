'use client';

import { useEffect, useState } from 'react';
import { getTenants, getTenantStats } from '@/lib/api';
import { Tenant, TenantStats } from '@/types/tenant';
import { useAuth } from '@/context/auth-context';
import { AddClientDialog } from '@/components/clients/AddClientDialog';
import { ClientStatsCards } from '@/components/clients/ClientStatsCards';
import { ClientsGrid } from '@/components/clients/ClientsGrid';
import { ClientsPageHeader } from '@/components/clients/ClientsPageHeader';

export default function ClientsPage() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const load = () => {
    setLoading(true);
    Promise.all([getTenants(), getTenantStats()])
      .then(([t, s]) => {
        setTenants(t);
        setStats(s);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
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
      <ClientsPageHeader isAdmin={isAdmin} onAddClient={() => setShowAdd(true)} />
      <ClientStatsCards stats={stats} />
      <ClientsGrid tenants={tenants} isAdmin={isAdmin} />

      <AddClientDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={load}
      />
    </div>
  );
}
