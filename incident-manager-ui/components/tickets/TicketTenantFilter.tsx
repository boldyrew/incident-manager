'use client';

import { Button } from '@/components/ui/button';
import { TicketTenantSummary } from '@/types/ticket';
import { ChevronDown } from 'lucide-react';

interface TicketTenantFilterProps {
  tenants: TicketTenantSummary[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TicketTenantFilter({ tenants, selectedIds, onChange }: TicketTenantFilterProps) {
  if (tenants.length === 0) return null;

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const label =
    selectedIds.length === 0
      ? 'All tenants'
      : selectedIds.length === 1
        ? tenants.find((t) => t.id === selectedIds[0])?.name ?? '1 tenant'
        : `${selectedIds.length} tenants`;

  return (
    <details className="group mb-4 rounded-lg border border-border bg-card/40 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/30">
        <span>Tenants: {label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border px-3 py-3">
        <div className="flex max-h-48 flex-col gap-2.5 overflow-y-auto pr-1">
          {tenants.map((t) => (
            <label
              key={t.id}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border bg-background accent-primary"
                checked={selectedIds.includes(t.id)}
                onChange={() => toggle(t.id)}
              />
              <span className="truncate" title={t.name}>
                {t.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">({t.alias})</span>
            </label>
          ))}
        </div>
        {selectedIds.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3 h-8 text-muted-foreground"
            onClick={() => onChange([])}
          >
            Clear selection
          </Button>
        )}
      </div>
    </details>
  );
}
