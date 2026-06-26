'use client';

import { useRouter } from 'next/navigation';
import { FlaskConical } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export function DemoBanner() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleExit = () => {
    logout();
    router.push('/demo');
  };

  return (
    <div className="w-full flex items-center justify-between px-4 py-2 bg-amber-500/10 border-b border-amber-500/25 text-amber-400 text-sm shrink-0">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4 shrink-0" />
        <span>You are in demo mode — data is shared and resets periodically.</span>
      </div>
      <button
        onClick={handleExit}
        className="text-xs font-medium px-2.5 py-1 rounded border border-amber-500/40 hover:bg-amber-500/15 transition-colors shrink-0"
      >
        Exit demo
      </button>
    </div>
  );
}
