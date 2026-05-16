import { Badge } from '@/components/ui/badge';
import type { TicketStatus } from './types';

const statusConfig: Record<TicketStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Open', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'outline' },
  awaiting_response: { label: 'Awaiting Response', variant: 'secondary' },
  resolved: { label: 'Resolved', variant: 'default' },
  closed: { label: 'Closed', variant: 'secondary' },
};

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export const TicketStatusBadge = ({ status, className }: TicketStatusBadgeProps) => {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};
