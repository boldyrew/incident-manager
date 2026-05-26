'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/lib/utils';
import { Incident } from '@/types/incident';

interface IncidentsTableProps {
  incidents: Incident[];
  loading: boolean;
  onEdit: (incident: Incident) => void;
  onDelete: (id: string) => void;
}

export function IncidentsTable({ incidents, loading, onEdit, onDelete }: IncidentsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead>Incident ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Detected Time</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted/40 rounded animate-pulse w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                  No incidents found
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((incident) => (
                <TableRow key={incident.id} className="border-b border-border">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {incident.code}
                  </TableCell>
                  <TableCell className="font-medium text-foreground max-w-xs">
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="line-clamp-1 hover:text-blue-400 transition-colors"
                    >
                      {incident.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={incident.severity} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={incident.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{incident.client}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {incident.assignedUser?.fullName ?? (
                      <span className="italic text-muted-foreground/50">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(incident.detectedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(incident)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(incident.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Incident</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The incident will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
