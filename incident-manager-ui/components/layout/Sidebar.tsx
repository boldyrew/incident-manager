'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  AlertTriangle,
  LayoutDashboard,
  FileText,
  Building2,
  Settings,
  Ticket,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { nameInitials } from '@/lib/nameInitials';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    disabled: true,
  },
  {
    href: '/incidents',
    label: 'Incidents',
    icon: AlertTriangle,
    disabled: false,
  },
  {
    href: '/tickets',
    label: 'Tickets',
    icon: Ticket,
    disabled: false,
  },
  { href: '/reports', label: 'Reports', icon: FileText, disabled: true },
  { href: '/clients', label: 'Clients', icon: Building2, disabled: true },
  { href: '/settings', label: 'Settings', icon: Settings, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/20 rounded-md">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">SecureOps</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">Incident Response Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, disabled }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={disabled ? '#' : href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
              )}
              aria-disabled={disabled}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
              {disabled && (
                <span className="ml-auto text-[10px] text-muted-foreground/60 border border-border rounded px-1">
                  soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary">
              {user ? nameInitials(user.fullName) : 'SA'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.fullName ?? 'Security Analyst'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.role ?? 'SecureOps'}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
