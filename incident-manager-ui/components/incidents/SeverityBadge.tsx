import { cn } from '@/lib/utils';
import { IncidentSeverity } from '@/types/incident';

interface SeverityBadgeProps {
  severity: IncidentSeverity;
}

const config: Record<IncidentSeverity, { label: string; className: string }> = {
  CRITICAL: {
    label: 'Critical',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  HIGH: {
    label: 'High',
    className: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  },
  LOW: {
    label: 'Low',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { label, className } = config[severity];
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
