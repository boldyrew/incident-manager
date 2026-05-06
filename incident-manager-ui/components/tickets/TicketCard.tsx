import { Badge } from '@/components/ui/badge';
import {
  getTicketPriorityBadgeVariant,
  getTicketStatusBadgeVariant,
} from '@/lib/ticketBadgeVariants';
import { formatDate } from '@/lib/utils';
import { TicketBase } from '@/types/ticket';

export interface TicketCardProps {
  ticket: TicketBase;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  return (
    <div className="border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-blue-400">{ticket.code}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getTicketPriorityBadgeVariant(ticket.priority)} label={ticket.priority} />
          <Badge
            variant={getTicketStatusBadgeVariant(ticket.status)}
            label={ticket.status.replace('_', ' ')}
          />
        </div>
      </div>
      <div>
        <h4
          className="mb-4 cursor-pointer hover:text-blue-400 transition-colors"
          // onClick={() => handleOpenModal(ticket.id)}
        >
          {ticket.title}
        </h4>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Assigned To:</span>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs">
                {ticket.assignedTo
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <span>{ticket.assignedTo ? ticket.assignedTo : 'Unassigned'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Linked Incident:</span>
            <span className="text-blue-400">{/* {ticket.linkedIncident} */}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Created:</span>
            <span className="text-gray-400">{formatDate(ticket.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
