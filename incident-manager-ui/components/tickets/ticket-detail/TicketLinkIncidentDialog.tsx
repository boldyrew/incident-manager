'use client';

import { SeverityBadge } from '@/components/incidents/SeverityBadge';
import { StatusBadge } from '@/components/incidents/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTicketDetail } from '@/context/ticket-context';
import { getIncidents, linkIncident } from '@/lib/api';
import { Incident } from '@/types/incident';
import { useEffect, useState } from 'react';

export interface TicketLinkIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketLinkIncidentDialog({ open, onOpenChange }: TicketLinkIncidentDialogProps) {
  const { ticket, refetch } = useTicketDetail();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | undefined>(undefined);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    if (!open) {
      setSelectedIncidentId(undefined);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchIncidents();
    }
  }, [open]);

  async function fetchIncidents() {
    const incidents = await getIncidents({ tenantId: ticket.tenant?.id });
    setIncidents(incidents);
  }

  async function handleConfirmLink() {
    if (!selectedIncidentId) return;
    await linkIncident(ticket.id, selectedIncidentId);
    await refetch?.();
    onOpenChange(false);
    setSelectedIncidentId(undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link to Incident</DialogTitle>
        </DialogHeader>
        <div className="grid min-w-0 gap-2 py-2">
          <Label htmlFor="link-incident">Incident</Label>
          <Select value={selectedIncidentId} onValueChange={setSelectedIncidentId}>
            <SelectTrigger id="link-incident" className="w-full min-w-0">
              <SelectValue
                placeholder="Select an incident"
                className="min-w-0 flex-1 truncate text-left"
              />
            </SelectTrigger>
            <SelectContent className="z-[100] max-h-[min(320px,var(--radix-select-content-available-height))]">
              {incidents.map((inc) => (
                <SelectItem key={inc.id} value={inc.id}>
                  <span className="font-mono text-xs text-muted-foreground">{inc.code}</span>
                  <span className="ml-2">{inc.title}</span>
                  <span className="ml-2">
                    <SeverityBadge severity={inc.severity} />
                  </span>
                  <span className="ml-2">
                    <StatusBadge status={inc.status} />
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!selectedIncidentId} onClick={handleConfirmLink}>
            Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
