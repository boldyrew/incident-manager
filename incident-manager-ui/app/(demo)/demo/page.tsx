'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, AlertTriangle, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { demoLoginRequest } from '@/lib/auth';
import { UserRole } from '@/context/auth-context';

const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';

const ROLES: {
  role: UserRole;
  label: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  capabilities: string[];
}[] = [
  {
    role: 'ADMIN',
    label: 'Security Admin',
    tagline: 'Full Platform Access',
    description: 'Manage the entire platform — clients, users, incidents, and system configuration.',
    icon: Shield,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
    capabilities: ['Manage all clients & tenants', 'View and edit all incidents', 'Assign analysts to cases', 'Access system settings'],
  },
  {
    role: 'ANALYST',
    label: 'Security Analyst',
    tagline: 'Incident Response',
    description: 'Investigate and triage security incidents, manage tickets, and collaborate with the team.',
    icon: AlertTriangle,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/15',
    capabilities: ['Triage and escalate incidents', 'Create and manage tickets', 'Add investigation notes', 'Update severity & status'],
  },
  {
    role: 'CLIENT_USER',
    label: 'Client View',
    tagline: 'Tenant Portal',
    description: 'See the platform through a client\'s eyes — incidents and tickets scoped to your organisation.',
    icon: Building2,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/15',
    capabilities: ['View organisation incidents', 'Track ticket progress', 'Read-only dashboard', 'Scoped to Demo Corp'],
  },
];

export default function DemoPage() {
  const { login, token, isLoading } = useAuth();
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!DEMO_ENABLED) {
      router.replace('/login');
      return;
    }
    if (!isLoading && token) {
      router.replace('/incidents');
    }
  }, [isLoading, token, router]);

  const handleEnter = async (role: UserRole) => {
    setError('');
    setLoadingRole(role);
    try {
      const { accessToken, user } = await demoLoginRequest(role);
      login(accessToken, user);
      router.push('/incidents');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
      setLoadingRole(null);
    }
  };

  if (!DEMO_ENABLED || isLoading || token) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)] pointer-events-none" />

      <div className="relative w-full max-w-4xl flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">SecureOps</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Live Demo
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Explore SecureOps</h1>
            <p className="text-muted-foreground mt-2 max-w-md">
              Select a role to enter the demo instantly — no account required.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {ROLES.map(({ role, label, tagline, description, icon: Icon, iconColor, iconBg, capabilities }) => {
            const isThisLoading = loadingRole === role;
            const isOtherLoading = loadingRole !== null && loadingRole !== role;

            return (
              <div
                key={role}
                className={`
                  flex flex-col gap-5 bg-card border rounded-xl p-6 transition-all duration-200
                  ${isOtherLoading ? 'opacity-40' : 'opacity-100'}
                  ${!loadingRole ? 'hover:border-primary/40 hover:bg-accent/20 cursor-pointer' : ''}
                  border-border
                `}
              >
                <div className="flex flex-col gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{tagline}</p>
                    <h2 className="text-lg font-semibold text-foreground mt-0.5">{label}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>

                <ul className="flex flex-col gap-1.5 flex-1">
                  {capabilities.map((cap) => (
                    <li key={cap} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
                      {cap}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleEnter(role)}
                  disabled={!!loadingRole}
                  className={`
                    mt-auto w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isThisLoading
                      ? 'bg-primary/80 text-primary-foreground cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
                    }
                  `}
                >
                  {isThisLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Entering…
                    </>
                  ) : (
                    `Enter as ${label}`
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-2.5">
            {error}
          </p>
        )}

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-muted-foreground">
            Demo data resets periodically. Changes made during the demo may not persist.
          </p>
          <p className="text-sm text-muted-foreground">
            Have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
