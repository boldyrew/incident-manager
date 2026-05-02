'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createIncident, updateIncident } from '@/lib/api';
import { Incident, CreateIncidentPayload } from '@/types/incident';

interface IncidentFormProps {
  open: boolean;
  incident: Incident | null;
  onClose: () => void;
  onSuccess: () => void;
}

function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

function defaultDetectedAt(): string {
  return toLocalDatetimeValue(new Date().toISOString());
}

const blank: CreateIncidentPayload = {
  title: '',
  description: '',
  severity: 'MEDIUM',
  status: 'OPEN',
  client: '',
  assignedTo: '',
  detectedAt: '',
};

export function IncidentForm({
  open,
  incident,
  onClose,
  onSuccess,
}: IncidentFormProps) {
  const [form, setForm] = useState<CreateIncidentPayload>({
    ...blank,
    detectedAt: defaultDetectedAt(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (incident) {
        setForm({
          title: incident.title,
          description: incident.description ?? '',
          severity: incident.severity,
          status: incident.status,
          client: incident.client,
          assignedTo: incident.assignedTo ?? '',
          detectedAt: toLocalDatetimeValue(incident.detectedAt),
        });
      } else {
        setForm({ ...blank, detectedAt: defaultDetectedAt() });
      }
      setError(null);
    }
  }, [incident, open]);

  const set = (patch: Partial<CreateIncidentPayload>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: CreateIncidentPayload = {
        ...form,
        description: form.description || undefined,
        assignedTo: form.assignedTo || undefined,
        detectedAt: new Date(form.detectedAt).toISOString(),
      };

      if (incident) {
        await updateIncident(incident.id, payload);
      } else {
        await createIncident(payload);
      }
      onSuccess();
    } catch {
      setError('Failed to save incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {incident ? 'Edit Incident' : 'Create Incident'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="Brief description of the incident"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="Detailed description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Severity *</Label>
              <Select
                value={form.severity}
                onValueChange={(v) =>
                  set({ severity: v as CreateIncidentPayload['severity'] })
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
                onValueChange={(v) =>
                  set({ status: v as CreateIncidentPayload['status'] })
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

          <div className="space-y-1.5">
            <Label htmlFor="client">Client *</Label>
            <Input
              id="client"
              value={form.client}
              onChange={(e) => set({ client: e.target.value })}
              placeholder="Client name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Input
              id="assignedTo"
              value={form.assignedTo}
              onChange={(e) => set({ assignedTo: e.target.value })}
              placeholder="Analyst name (optional)"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="detectedAt">Detected At *</Label>
            <Input
              id="detectedAt"
              type="datetime-local"
              value={form.detectedAt}
              onChange={(e) => set({ detectedAt: e.target.value })}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Saving...'
                : incident
                  ? 'Save Changes'
                  : 'Create Incident'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
