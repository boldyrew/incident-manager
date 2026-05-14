'use client';

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
import { useEffect, useState } from 'react';

export interface TicketLinkIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Mock incidents for linking until the API is wired. */
const MOCK_LINKABLE_INCIDENTS = [
  { id: 'mock-1', code: 'INC-2024-0142', title: 'Suspicious login attempts from unknown IP' },
  { id: 'mock-2', code: 'INC-2024-0188', title: 'Malware detected on finance workstation' },
  { id: 'mock-3', code: 'INC-2024-0201', title: 'Phishing campaign targeting accounts payable' },
  { id: 'mock-4', code: 'INC-2024-0224', title: 'Unusual outbound traffic to rare destinations' },
  { id: 'mock-5', code: 'INC-2024-0237', title: 'Privilege escalation detected on domain controller' },
] as const;

export function TicketLinkIncidentDialog({ open, onOpenChange }: TicketLinkIncidentDialogProps) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!open) {
      setSelectedIncidentId(undefined);
    }
  }, [open]);

  function handleConfirmLink() {
    if (!selectedIncidentId) return;
    // Mock only: no API call yet.
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
          <Select
            value={selectedIncidentId}
            onValueChange={setSelectedIncidentId}
          >
            <SelectTrigger id="link-incident" className="w-full min-w-0">
              <SelectValue
                placeholder="Select an incident"
                className="min-w-0 flex-1 truncate text-left"
              />
            </SelectTrigger>
            <SelectContent className="z-[100] max-h-[min(320px,var(--radix-select-content-available-height))]">
              {MOCK_LINKABLE_INCIDENTS.map((inc) => (
                <SelectItem key={inc.id} value={inc.id}>
                  <span className="font-mono text-xs text-muted-foreground">{inc.code}</span>
                  <span className="ml-2">{inc.title}</span>
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
