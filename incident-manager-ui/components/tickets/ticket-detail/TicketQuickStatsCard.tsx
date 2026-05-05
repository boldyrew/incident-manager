'use client';

import { ContentPanel } from '@/components/layout/ContentPanel';

const defaultRows: [string, string][] = [
  ['Time Open', '2d 18h'],
  ['Comments', '3'],
  ['Status Changes', '1'],
  ['Watchers', '3'],
];

export interface TicketQuickStatsCardProps {
  rows?: [string, string][];
}

export function TicketQuickStatsCard({ rows = defaultRows }: TicketQuickStatsCardProps) {
  return (
    <ContentPanel title='Quick Stats'>
      <ul className="space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-4">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium tabular-nums text-foreground">{v}</span>
          </li>
        ))}
      </ul>
    </ContentPanel>
  );
}
