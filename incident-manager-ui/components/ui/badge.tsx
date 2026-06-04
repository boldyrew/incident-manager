import { cn } from '@/lib/utils';

export type BadgeVariant = 'critical' | 'warning' | 'caution' | 'info' | 'success' | 'neutral';

const classNameByVariant: Record<BadgeVariant, string> = {
  neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  caution: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  warning: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
  label: string;
}

export function Badge({ variant = 'neutral', className: customClassName, label }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold',
        classNameByVariant[variant],
        customClassName,
      )}
    >
      {label}
    </span>
  );
}
