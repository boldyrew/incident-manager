'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IncidentSeverity, IncidentStatus } from '@/types/incident';
import { X } from 'lucide-react';

interface IncidentFiltersProps {
  severity: IncidentSeverity | 'ALL';
  status: IncidentStatus | 'ALL';
  onSeverityChange: (value: IncidentSeverity | 'ALL') => void;
  onStatusChange: (value: IncidentStatus | 'ALL') => void;
}

export function IncidentFilters({
  severity,
  status,
  onSeverityChange,
  onStatusChange,
}: IncidentFiltersProps) {
  const hasFilters = severity !== 'ALL' || status !== 'ALL';

  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <Select
        value={severity}
        onValueChange={(v) => onSeverityChange(v as IncidentSeverity | 'ALL')}
      >
        <SelectTrigger className="w-40 bg-card">
          <SelectValue placeholder="All Severities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Severities</SelectItem>
          <SelectItem value="CRITICAL">Critical</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => onStatusChange(v as IncidentStatus | 'ALL')}>
        <SelectTrigger className="w-44 bg-card">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="RESOLVED">Resolved</SelectItem>
          <SelectItem value="CLOSED">Closed</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onSeverityChange('ALL');
            onStatusChange('ALL');
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
