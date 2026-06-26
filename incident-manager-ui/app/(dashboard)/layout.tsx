'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { useAuth } from '@/context/auth-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/login');
    }
  }, [isLoading, token, router]);

  if (isLoading || !token) return null;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {user?.isDemo && <DemoBanner />}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Topbar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
