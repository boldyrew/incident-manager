'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserSelect, type UserSelectOption } from '@/components/ui/UserSelect';
import { useEffect, useState } from 'react';

/** Mock roster for the re-assign flow (UI only; not wired to the API). */
const MOCK_ASSIGNABLE_USERS: readonly UserSelectOption[] = [
  { id: 'mock-user-1', name: 'Sarah Chen', email: 'sarah.chen@secureops.example' },
  { id: 'mock-user-2', name: 'James Walker', email: 'james.walker@secureops.example' },
  { id: 'mock-user-3', name: 'Maria Rodriguez', email: 'maria.rodriguez@secureops.example' },
  { id: 'mock-user-4', name: 'David Kim', email: 'david.kim@secureops.example' },
  { id: 'mock-user-5', name: 'Alex Rivera', email: 'alex.rivera@secureops.example' },
];

export interface TicketReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Override mock users when wiring to real data later. */
  users?: readonly UserSelectOption[];
}

export function TicketReassignDialog({
  open,
  onOpenChange,
  users = MOCK_ASSIGNABLE_USERS,
}: TicketReassignDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!open) setSelectedUserId(undefined);
  }, [open]);

  function handleConfirmAssign() {
    if (!selectedUserId) return;
    onOpenChange(false);
    setSelectedUserId(undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign ticket</DialogTitle>
          <DialogDescription>
            Choose who should own this ticket. This preview uses mock users only.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-2">
          <Label htmlFor="reassign-user">Assign to</Label>
          <UserSelect
            id="reassign-user"
            users={users}
            value={selectedUserId}
            onValueChange={setSelectedUserId}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!selectedUserId} onClick={handleConfirmAssign}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
