'use client';

import { useEffect, useState } from 'react';
import { Building2, AlertTriangle, XCircle, CheckCircle2, Plus, X } from 'lucide-react';
import { getTenants, getTenantStats, createTenant } from '@/lib/api';
import { Tenant, TenantStats, TenantTier, CreateTenantPayload } from '@/types/tenant';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const tierConfig: Record<TenantTier, { label: string; className: string }> = {
  ENTERPRISE: { label: 'Enterprise', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  PROFESSIONAL: { label: 'Professional', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  STARTER: { label: 'Starter', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

function TierBadge({ tier }: { tier: TenantTier }) {
  const { label, className } = tierConfig[tier];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

function SummaryCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ClientCard({ tenant }: { tenant: Tenant }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{tenant.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{tenant.industry ?? 'General'}</p>
        </div>
        <TierBadge tier={tenant.tier} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xl font-bold text-orange-400">{tenant.openIncidents}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Open</p>
        </div>
        <div>
          <p className="text-xl font-bold text-red-400">{tenant.criticalIncidents}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Critical</p>
        </div>
        <div>
          <p className="text-xl font-bold text-emerald-400">{tenant.resolvedThisMonth}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Resolved</p>
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

const blankForm: CreateTenantPayload = {
  name: '',
  alias: '',
  industry: '',
  tier: 'PROFESSIONAL',
  status: 'ACTIVE',
};

function AddClientDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<CreateTenantPayload>(blankForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(blankForm);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createTenant({
        ...form,
        industry: form.industry || undefined,
      });
      onSuccess();
      onClose();
    } catch {
      setError('Failed to create client. Check that the alias is unique.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Acme Corp"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="alias">Alias (unique identifier)</Label>
            <Input
              id="alias"
              value={form.alias}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  alias: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                }))
              }
              placeholder="acme-corp"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              placeholder="Technology"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tier</Label>
            <Select
              value={form.tier}
              onValueChange={(v) => setForm((f) => ({ ...f, tier: v as TenantTier }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                <SelectItem value="STARTER">Starter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientsPage() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const load = () => {
    setLoading(true);
    Promise.all([getTenants(), getTenantStats()])
      .then(([t, s]) => {
        setTenants(t);
        setStats(s);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage client accounts and security posture
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAdd(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          icon={<Building2 className="h-5 w-5 text-blue-400" />}
          iconBg="bg-blue-400/10"
          label="Total Clients"
          value={stats?.totalClients ?? 0}
        />
        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5 text-orange-400" />}
          iconBg="bg-orange-400/10"
          label="Total Open Incidents"
          value={stats?.openIncidents ?? 0}
        />
        <SummaryCard
          icon={<XCircle className="h-5 w-5 text-red-400" />}
          iconBg="bg-red-400/10"
          label="Critical Incidents"
          value={stats?.criticalIncidents ?? 0}
        />
        <SummaryCard
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
          iconBg="bg-emerald-400/10"
          label="Resolved This Month"
          value={stats?.resolvedThisMonth ?? 0}
        />
      </div>

      {/* Client cards grid */}
      {tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Building2 className="h-12 w-12 opacity-30" />
          <p className="text-sm">No clients yet. {isAdmin && 'Add one to get started.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {tenants.map((tenant) => (
            <ClientCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}

      <AddClientDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={load}
      />
    </div>
  );
}
