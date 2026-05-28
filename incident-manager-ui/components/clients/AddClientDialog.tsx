'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createTenant } from '@/lib/api';
import { CreateTenantPayload, TenantTier } from '@/types/tenant';
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

const blankForm: CreateTenantPayload = {
  name: '',
  alias: '',
  industry: '',
  tier: 'PROFESSIONAL',
  status: 'ACTIVE',
};

interface AddClientDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddClientDialog({ open, onClose, onSuccess }: AddClientDialogProps) {
  const [form, setForm] = useState<CreateTenantPayload>(blankForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(blankForm);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
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
              {loading ? 'Creating...' : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
