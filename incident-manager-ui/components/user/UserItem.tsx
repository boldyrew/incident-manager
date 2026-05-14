import { User } from '@/types/user';
import { UserAvatar } from './UserAvatar';

export interface UserItemProps {
  user: Pick<User, 'id' | 'fullName' | 'email'>;
}

export function UserItem({ user }: UserItemProps) {
  return (
    <div className="flex items-center gap-2">
      <UserAvatar name={user.fullName} />
      <div className="flex flex-col gap-0.5">
        <span className="block font-medium text-foreground">{user.fullName}</span>
        <span className="block text-xs text-muted-foreground">{user.email}</span>
      </div>
    </div>
  );
}
