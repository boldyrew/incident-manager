import { cn } from '@/lib/utils';
import { IncidentStatus } from '@/types/incident';

interface StatusBadgeProps {
  status: IncidentStatus;
}

const config: Record<IncidentStatus, { label: string; className: string }> = {
  OPEN: {
    label: 'Open',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-green-500/15 text-green-400 border-green-500/30',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold',
        className,
      )}
    >
      {label}
    </span>
  );
}
