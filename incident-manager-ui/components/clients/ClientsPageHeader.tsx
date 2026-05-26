import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientsPageHeaderProps {
  isAdmin: boolean;
  onAddClient: () => void;
}

export function ClientsPageHeader({ isAdmin, onAddClient }: ClientsPageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clients</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage client accounts and security posture
        </p>
      </div>
      {isAdmin && (
        <Button onClick={onAddClient} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      )}
    </div>
  );
}
