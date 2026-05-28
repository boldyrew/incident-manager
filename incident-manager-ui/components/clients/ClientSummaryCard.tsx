import { ReactNode } from 'react';

interface ClientSummaryCardProps {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: number;
}

export function ClientSummaryCard({ icon, iconBg, label, value }: ClientSummaryCardProps) {
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
