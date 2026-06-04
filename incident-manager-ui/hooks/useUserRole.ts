import { useAuth } from '@/context/auth-context';

function isStaffRole(role: string | undefined): boolean {
  return role === 'ADMIN' || role === 'ANALYST';
}

export function useUserRole() {
  const { user } = useAuth();

  return {
    isStaffRole: isStaffRole(user?.role),
  };
}
