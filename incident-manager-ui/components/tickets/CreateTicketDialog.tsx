'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createTicket, getAnalysts, getIncidents, getTenants } from '@/lib/api';
import { Incident } from '@/types/incident';
import { CreateTicketPayload, TicketPriority, TicketStatus } from '@/types/ticket';
import { Tenant } from '@/types/tenant';
import { User } from '@/types/user';

interface CreateTicketDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FormState = {
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  tenantId: string;
  assignedUserId: string;
  incidentId: string;
};

const blankForm: FormState = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'OPEN',
  tenantId: '',
  assignedUserId: '',
  incidentId: '',
};

const UNASSIGNED_VALUE = '__UNASSIGNED__';
const NO_INCIDENT_VALUE = '__NO_INCIDENT__';

export function CreateTicketDialog({ open, onClose, onSuccess }: CreateTicketDialogProps) {
  const [form, setForm] = useState<FormState>(blankForm);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [analysts, setAnalysts] = useState<User[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSelectIncident = Boolean(form.tenantId);

  useEffect(() => {
    if (!open) return;
    setForm(blankForm);
    setIncidents([]);
    setError(null);
    void loadStaticData();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!form.tenantId) {
      setIncidents([]);
      setForm((prev) => ({ ...prev, incidentId: '' }));
      return;
    }
    void loadIncidentsByTenant(form.tenantId);
  }, [form.tenantId, open]);

  const sortedTenants = useMemo(
    () => [...tenants].sort((a, b) => a.name.localeCompare(b.name)),
    [tenants],
  );

  async function loadStaticData() {
    try {
      const [tenantData, analystData] = await Promise.all([getTenants(), getAnalysts()]);
      setTenants(tenantData);
      setAnalysts(analystData);
    } catch {
      setError('Failed to load clients and analysts.');
    }
  }

  async function loadIncidentsByTenant(tenantId: string) {
    try {
      setIsLoadingIncidents(true);
      const incidentData = await getIncidents({ tenantId });
      setIncidents(incidentData);
    } catch {
      setError('Failed to load incidents for selected client.');
    } finally {
      setIsLoadingIncidents(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload: CreateTicketPayload = {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        status: form.status,
        tenantId: form.tenantId,
        assignedUserId: form.assignedUserId || undefined,
        incidentId: form.incidentId || undefined,
      };

      await createTicket(payload);
      onSuccess();
      onClose();
    } catch {
      setError('Failed to create ticket. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Ticket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="ticket-title">Title *</Label>
            <Input
              id="ticket-title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize the remediation task"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ticket-description">Description</Label>
            <Textarea
              id="ticket-description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Provide implementation details, constraints, and expected outcome"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Priority *</Label>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, priority: value as TicketPriority }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value as TicketStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Client *</Label>
              <Select
                value={form.tenantId}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, tenantId: value, incidentId: '' }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {sortedTenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Assign to analyst</Label>
              <Select
                value={form.assignedUserId || UNASSIGNED_VALUE}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    assignedUserId: value === UNASSIGNED_VALUE ? '' : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                  {analysts.map((analyst) => (
                    <SelectItem key={analyst.id} value={analyst.id}>
                      {analyst.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Attach incident</Label>
            <Select
              value={form.incidentId || NO_INCIDENT_VALUE}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  incidentId: value === NO_INCIDENT_VALUE ? '' : value,
                }))
              }
              disabled={!canSelectIncident || isLoadingIncidents}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !canSelectIncident
                      ? 'Select a client first'
                      : isLoadingIncidents
                        ? 'Loading incidents...'
                        : 'Optional: choose incident'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_INCIDENT_VALUE}>No linked incident</SelectItem>
                {incidents.map((incident) => (
                  <SelectItem key={incident.id} value={incident.id}>
                    {incident.code} - {incident.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !form.tenantId}>
              {isLoading ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
