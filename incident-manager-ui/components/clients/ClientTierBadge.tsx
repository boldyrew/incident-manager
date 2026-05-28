import { TenantTier } from '@/types/tenant';

const tierConfig: Record<TenantTier, { label: string; className: string }> = {
  ENTERPRISE: { label: 'Enterprise', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  PROFESSIONAL: { label: 'Professional', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  STARTER: { label: 'Starter', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

export function ClientTierBadge({ tier }: { tier: TenantTier }) {
  const { label, className } = tierConfig[tier];

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
