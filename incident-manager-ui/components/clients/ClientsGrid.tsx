import { Tenant } from '@/types/tenant';
import { ClientCard } from './ClientCard';
import { ClientsEmptyState } from './ClientsEmptyState';

interface ClientsGridProps {
  tenants: Tenant[];
  isAdmin: boolean;
}

export function ClientsGrid({ tenants, isAdmin }: ClientsGridProps) {
  if (tenants.length === 0) {
    return <ClientsEmptyState isAdmin={isAdmin} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {tenants.map((tenant) => (
        <ClientCard key={tenant.id} tenant={tenant} />
      ))}
    </div>
  );
}
