import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, ChevronRight, Clock, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTickets } from './useTickets';
import { TicketStatusBadge } from './TicketStatusBadge';
import { CreateTicketDialog } from './CreateTicketDialog';

interface TicketsListProps {
  onSelectTicket?: (ticketId: string) => void;
  maxHeight?: string;
}

export const TicketsList = ({ onSelectTicket, maxHeight = '400px' }: TicketsListProps) => {
  const { data: tickets, isLoading, error } = useTickets();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm sm:text-base">Support Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-destructive">Failed to load tickets</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Support Tickets
          </CardTitle>
          <CardDescription className="text-[10px] sm:text-xs mt-1">
            {tickets?.length || 0} total tickets
          </CardDescription>
        </div>
        <CreateTicketDialog />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        {!tickets || tickets.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No tickets yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a ticket if you need help
            </p>
            <CreateTicketDialog>
              <Button size="sm" className="mt-3">
                Create Ticket
              </Button>
            </CreateTicketDialog>
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }}>
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => onSelectTicket?.(ticket.id)}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors active:scale-[0.98]"
                >
                  <div className="h-9 w-9 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {ticket.ticket_number}
                      </span>
                      <TicketStatusBadge status={ticket.status} className="text-[10px]" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium truncate mt-0.5">
                      {ticket.subject}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
