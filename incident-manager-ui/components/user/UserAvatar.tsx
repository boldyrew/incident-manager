import { nameInitials } from '@/lib/nameInitials';
import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  name: string;
  className?: string;
}

export function UserAvatar({ name, className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-xs font-medium text-white',
        className,
      )}
      aria-hidden
    >
      {nameInitials(name)}
    </span>
  );
}
