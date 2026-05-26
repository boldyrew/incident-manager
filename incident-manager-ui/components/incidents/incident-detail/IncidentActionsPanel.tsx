'use client';

import { IncidentForm } from '@/components/incidents/IncidentForm';
import { IncidentReassignDialog } from '@/components/incidents/incident-detail/IncidentReassignDialog';
import { ContentPanel } from '@/components/layout/ContentPanel';
import { Button } from '@/components/ui/button';
import { useIncidentDetail } from '@/context/incident-context';
import { useUserRole } from '@/hooks/useUserRole';
import { useState } from 'react';

export function IncidentActionsPanel() {
  const [editOpen, setEditOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const { incident, refetch } = useIncidentDetail();
  const { isStaffRole } = useUserRole();

  return (
    <ContentPanel title="Actions">
      <div className="flex flex-col gap-2">
        {isStaffRole && (
          <>
            <Button className="w-full" type="button" onClick={() => setReassignOpen(true)}>
              Reassign Incident
            </Button>
            <Button
              variant="secondary"
              className="w-full bg-secondary hover:bg-secondary/80"
              type="button"
              onClick={() => setEditOpen(true)}
            >
              Edit Incident
            </Button>
          </>
        )}
        <Button variant="secondary" className="w-full bg-secondary hover:bg-secondary/80">
          Export Details
        </Button>
      </div>

      {isStaffRole && (
        <>
          <IncidentReassignDialog open={reassignOpen} onOpenChange={setReassignOpen} />
          <IncidentForm
            open={editOpen}
            incident={incident}
            onClose={() => setEditOpen(false)}
            onSuccess={() => {
              setEditOpen(false);
              refetch();
            }}
          />
        </>
      )}
    </ContentPanel>
  );
}
