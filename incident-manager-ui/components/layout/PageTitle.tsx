'use client';

import type { ReactNode } from 'react';

export interface PageTitleProps {
  title: string;
  subtitle?: string;
  rightPanel?: ReactNode;
}

export default function PageTitle({ title, subtitle, rightPanel }: PageTitleProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
      </div>
      {rightPanel && <div className="shrink-0">{rightPanel}</div>}
    </div>
  );
}
