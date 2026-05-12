'use client';

import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import {
  getTicketPriorityBadgeVariant,
  getTicketStatusBadgeVariant,
} from '@/lib/ticketBadgeVariants';
import { cn, formatDate } from '@/lib/utils';
import { TicketBase } from '@/types/ticket';
import Link from 'next/link';

export interface TicketCardProps {
  ticket: TicketBase;
  /** When false, tenant strip uses neutral styling (e.g. single-tenant or all-tenants view). */
  highlightTenantStripe?: boolean;
}

function isStaffRole(role: string | undefined): boolean {
  return role === 'ADMIN' || role === 'ANALYST';
}

export default function TicketCard({ ticket, highlightTenantStripe = false }: TicketCardProps) {
  const { user } = useAuth();
  const showTenant = isStaffRole(user?.role) && ticket.tenant;
  const matchesUserTenant = Boolean(user?.tenantId && ticket.tenant?.id === user.tenantId);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 transition-all group hover:border-gray-700">
      {showTenant && ticket.tenant && (
        <div
          className={cn(
            'truncate border-b px-4 py-1 text-xs font-semibold leading-tight',
            highlightTenantStripe
              ? matchesUserTenant
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                : 'border-sky-500/25 bg-sky-500/[0.06] text-sky-100'
              : 'border-border bg-muted/30 text-muted-foreground',
          )}
          title={ticket.tenant.name}
        >
          {ticket.tenant.name}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">{ticket.code}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getTicketPriorityBadgeVariant(ticket.priority)} label={ticket.priority} />
            <Badge
              variant={getTicketStatusBadgeVariant(ticket.status)}
              label={ticket.status.replace('_', ' ')}
            />
          </div>
        </div>
        <div>
          <Link href={`/tickets/${ticket.code}`}>
            <h4
              className="mb-4 cursor-pointer hover:text-blue-400 transition-colors"
              // onClick={() => handleOpenModal(ticket.id)}
            >
              {ticket.title}
            </h4>
          </Link>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Assigned To:</span>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs">
                  {ticket.assignedTo
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <span>{ticket.assignedTo ? ticket.assignedTo : 'Unassigned'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Linked Incident:</span>
              <span className="text-blue-400">{/* {ticket.linkedIncident} */}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Created:</span>
              <span className="text-gray-400">{formatDate(ticket.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
