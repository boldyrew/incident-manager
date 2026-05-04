'use client';

import PageTitle from '@/components/layout/PageTitle';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import TicketCard from '@/components/tickets/TicketCard';
import { TicketBase } from '@/types/ticket';

const tickets: TicketBase[] = [
  {
    id: 'TKT-1247',
    title: 'Implement rate limiting on auth endpoints',
    severity: 'HIGH',
    status: 'OPEN',
    assignedTo: 'John Doe',
    linkedIncident: 'INC-2847',
    createdAt: '2026-04-30 14:35',
  },
  {
    id: 'TKT-1248',
    title: 'Review and update firewall rules',
    severity: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignedTo: 'Sarah Chen',
    linkedIncident: 'INC-2847',
    createdAt: '2026-04-30 14:40',
  },
  {
    id: 'TKT-1246',
    title: 'Deploy endpoint protection update',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    assignedTo: 'Mike Johnson',
    linkedIncident: 'INC-2846',
    createdAt: '2026-04-30 13:20',
  },
  {
    id: 'TKT-1245',
    title: 'Conduct phishing awareness training',
    severity: 'MEDIUM',
    status: 'OPEN',
    assignedTo: 'Sarah Chen',
    linkedIncident: 'INC-2845',
    createdAt: '2026-04-30 13:00',
  },
  {
    id: 'TKT-1244',
    title: 'Audit database access controls',
    severity: 'HIGH',
    status: 'RESOLVED',
    assignedTo: 'John Doe',
    linkedIncident: 'INC-2844',
    createdAt: '2026-04-30 11:45',
  },
  {
    id: 'TKT-1243',
    title: 'Update DDoS mitigation rules',
    severity: 'CRITICAL',
    status: 'RESOLVED',
    assignedTo: 'Mike Johnson',
    linkedIncident: 'INC-2843',
    createdAt: '2026-04-30 09:30',
  },
];

export default function TicketsPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar search={''} onSearchChange={() => {}} onCreateClick={() => {}} />
        <main className="flex-1 overflow-auto p-6">
          <PageTitle title="Tickets" subtitle="Remediation tasks linked to incidents" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((t) => (
              <TicketCard ticket={t} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
