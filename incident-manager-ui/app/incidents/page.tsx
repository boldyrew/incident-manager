'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { IncidentsTable } from '@/components/incidents/IncidentsTable';
import { IncidentFilters } from '@/components/incidents/IncidentFilters';
import { IncidentForm } from '@/components/incidents/IncidentForm';
import { getIncidents, deleteIncident } from '@/lib/api';
import { Incident, IncidentSeverity, IncidentStatus } from '@/types/incident';
import PageTitle from '@/components/layout/PageTitle';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState<IncidentSeverity | 'ALL'>('ALL');
  const [status, setStatus] = useState<IncidentStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getIncidents({
        severity: severity !== 'ALL' ? severity : undefined,
        status: status !== 'ALL' ? status : undefined,
        search: search || undefined,
      });
      setIncidents(data);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [severity, status, search]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleDelete = async (id: string) => {
    try {
      await deleteIncident(id);
      fetchIncidents();
    } catch (err) {
      console.error('Failed to delete incident:', err);
    }
  };

  const handleEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingIncident(null);
  };

  return (
    <>
      <div>
        <PageTitle
          title="Incidents"
          subtitle="Monitor and manage security incidents across all clients"
        />
        <IncidentFilters
          severity={severity}
          status={status}
          onSeverityChange={setSeverity}
          onStatusChange={setStatus}
        />

        <IncidentsTable
          incidents={incidents}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <IncidentForm
        open={isFormOpen}
        incident={editingIncident}
        onClose={handleFormClose}
        onSuccess={() => {
          handleFormClose();
          fetchIncidents();
        }}
      />
    </>
  );
}
