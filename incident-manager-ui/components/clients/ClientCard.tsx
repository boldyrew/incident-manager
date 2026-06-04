import { Tenant } from '@/types/tenant';
import { ClientTierBadge } from './ClientTierBadge';

export function ClientCard({ tenant }: { tenant: Tenant }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{tenant.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{tenant.industry ?? 'General'}</p>
        </div>
        <ClientTierBadge tier={tenant.tier} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-3xl font-bold text-orange-400">{tenant.openIncidents}</p>
          <p className="text-sm text-muted-foreground mt-0.5">Open</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-red-400">{tenant.criticalIncidents}</p>
          <p className="text-sm text-muted-foreground mt-0.5">Critical</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-emerald-400">{tenant.resolvedThisMonth}</p>
          <p className="text-sm text-muted-foreground mt-0.5">Resolved</p>
        </div>
      </div>

      <div className="border-t border-border pt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Status</span>
        <span className={tenant.status === 'ACTIVE' ? 'text-emerald-400 font-medium' : 'text-muted-foreground font-medium'}>
          {tenant.status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
}
