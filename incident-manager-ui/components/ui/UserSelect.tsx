'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface UserSelectOption {
  id: string;
  name: string;
  email: string;
}

const selectItemClassName = cn(
  'relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
);

export interface UserSelectProps {
  id?: string;
  users: readonly UserSelectOption[];
  value: string | undefined;
  onValueChange: (userId: string) => void;
  placeholder?: string;
}

export function UserSelect({
  id,
  users,
  value,
  onValueChange,
  placeholder = 'Select a team member',
}: UserSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-[100] max-h-[min(320px,var(--radix-select-content-available-height))]">
        {users.map((user) => (
          <SelectPrimitive.Item key={user.id} value={user.id} className={selectItemClassName}>
            <UserAvatar name={user.name} />
            <div className="ml-3 flex min-w-0 flex-1 flex-col gap-0.5 text-left">
              <SelectPrimitive.ItemText className="truncate font-medium leading-tight">
                {user.name}
              </SelectPrimitive.ItemText>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
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
