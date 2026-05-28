import { Building2 } from 'lucide-react';

export function ClientsEmptyState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
      <Building2 className="h-12 w-12 opacity-30" />
      <p className="text-sm">No clients yet. {isAdmin && 'Add one to get started.'}</p>
    </div>
  );
}
