'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserSelect, USER_SELECT_UNASSIGNED } from '@/components/user/UserSelect';
import { useIncidentDetail } from '@/context/incident-context';
import { assignIncident, getAnalysts } from '@/lib/api';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';

export interface IncidentReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IncidentReassignDialog({ open, onOpenChange }: IncidentReassignDialogProps) {
  const { incident, refetch } = useIncidentDetail();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (open) {
      setSelectedUserId(incident.assignedUser?.id ?? USER_SELECT_UNASSIGNED);
      fetchAnalysts();
    } else {
      setSelectedUserId(undefined);
    }
  }, [incident.assignedUser?.id, open]);

  async function fetchAnalysts() {
    const analysts = await getAnalysts();
    setUsers(analysts);
  }

  async function handleConfirmAssign() {
    const choice = selectedUserId ?? USER_SELECT_UNASSIGNED;
    const userId = choice === USER_SELECT_UNASSIGNED ? null : choice;
    await assignIncident(incident.id, userId);
    await refetch();
    onOpenChange(false);
    setSelectedUserId(undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Analyst</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <UserSelect
            id="assign-incident-analyst"
            users={users}
            value={selectedUserId ?? (open ? USER_SELECT_UNASSIGNED : undefined)}
            onValueChange={setSelectedUserId}
            allowUnassigned
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirmAssign}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
