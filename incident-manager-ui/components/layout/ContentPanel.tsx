import { PropsWithChildren } from 'react';

export interface ContentPanelProps {
  title?: string;
}

export function ContentPanel({ children, title }: PropsWithChildren<ContentPanelProps>) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      {title && <h2 className="mb-4 text-base font-semibold text-foreground">{title}</h2>}
      {children}
    </section>
  );
}
