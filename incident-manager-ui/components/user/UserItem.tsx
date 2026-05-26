import { UserBase } from '@/types/user';
import { cn } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';

export interface UserItemProps {
  type?: 'full' | 'compact';
  user: UserBase;
}

export function UserItem({ user, type = 'full' }: UserItemProps) {
  const isCompact = type === 'compact';
  const Root = isCompact ? 'span' : 'div';
  const Content = isCompact ? 'span' : 'div';

  return (
    <Root className={cn('items-center gap-2', isCompact ? 'inline-flex align-middle' : 'flex')}>
      <UserAvatar name={user.fullName} type={isCompact ? 'compact' : 'default'} />
      <Content className={cn('gap-0.5', isCompact ? 'inline-flex' : 'flex flex-col')}>
        <span className={cn('font-medium text-foreground', isCompact ? 'whitespace-nowrap' : 'block')}>
          {user.fullName}
        </span>
        {!isCompact && (
          <span className="block text-xs text-muted-foreground">{user.email}</span>
        )}
      </Content>
    </Root>
  );
}
