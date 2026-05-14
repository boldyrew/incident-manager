'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { UserAvatar } from '@/components/user/UserAvatar';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { User } from '@/types/user';
/** Sentinel value for clearing assignment (never a real user id). */
export const USER_SELECT_UNASSIGNED = '__unassigned__';

const selectItemClassName = cn(
  'relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
);

export interface UserSelectProps {
  id?: string;
  users: User[];
  value: string | undefined;
  onValueChange: (userId: string) => void;
  placeholder?: string;
  /** When true, adds an "Unassigned" option (value {@link USER_SELECT_UNASSIGNED}). */
  allowUnassigned?: boolean;
}

export function UserSelect({
  id,
  users,
  value,
  onValueChange,
  placeholder = 'Select a team member',
  allowUnassigned = false,
}: UserSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-[100] max-h-[min(320px,var(--radix-select-content-available-height))]">
        {allowUnassigned && (
          <SelectPrimitive.Item value={USER_SELECT_UNASSIGNED} className={selectItemClassName}>
            <div className="flex items-center gap-2">
              <UserAvatar
                name="Unassigned"
                className="from-muted to-muted-foreground/35 text-muted-foreground"
              />
              <div className="flex flex-col gap-0.5">
                <span className="block font-medium text-foreground">Unassigned</span>
                <span className="block text-xs text-muted-foreground">No analyst</span>
              </div>
            </div>
            <span className="absolute right-2 top-1/2 flex h-3.5 w-3.5 -translate-y-1/2 items-center justify-center">
              <SelectPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
              </SelectPrimitive.ItemIndicator>
            </span>
          </SelectPrimitive.Item>
        )}
        {users.map((user) => (
          <SelectPrimitive.Item key={user.id} value={user.id} className={selectItemClassName}>
            <div className="flex items-center gap-2">
              <UserAvatar name={user.fullName} />
              <div className="flex flex-col gap-0.5">
                <span className="block font-medium text-foreground">{user.fullName}</span>
                <span className="block text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <span className="absolute right-2 top-1/2 flex h-3.5 w-3.5 -translate-y-1/2 items-center justify-center">
              <SelectPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
              </SelectPrimitive.ItemIndicator>
            </span>
          </SelectPrimitive.Item>
        ))}
      </SelectContent>
    </Select>
  );
}
