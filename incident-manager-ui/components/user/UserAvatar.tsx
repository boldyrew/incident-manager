import { nameInitials } from '@/lib/nameInitials';
import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  name: string;
  type?: 'default' | 'compact';
  className?: string;
}

export function UserAvatar({ name, type = 'default', className }: UserAvatarProps) {
  const isCompact = type === 'compact';

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 font-medium text-white',
        isCompact ? 'h-5 w-5 text-[10px]' : 'h-9 w-9 text-xs',
        className,
      )}
      aria-hidden
    >
      {nameInitials(name)}
    </span>
  );
}
