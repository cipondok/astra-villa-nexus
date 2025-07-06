import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Send, User } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  description?: string;
  complaint_type: string;
  priority: string;
  status: string;
  created_at: string;
}

interface CSTicketsTableProps {
  tickets: Ticket[] | undefined;
  isLoading: boolean;
  type: 'my-tickets' | 'available';
  onReply?: (ticket: Ticket) => void;
  onAssign?: (ticketId: string) => void;
  isAssigning?: boolean;
}

const CSTicketsTable = ({ 
  tickets, 
  isLoading, 
  type, 
  onReply, 
  onAssign, 
  isAssigning 
}: CSTicketsTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
      case 'new':
        return <Badge className="bg-blue-500 text-white">Open</Badge>;
      case 'in_progress':
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">In Progress</Badge>;
      case 'resolved':
      case 'responded':
        return <Badge className="bg-green-500 text-white">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500 text-white">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500 text-white">High</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500 text-white">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500 text-white">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getEmptyMessage = () => {
    switch (type) {
      case 'my-tickets':
        return 'No tickets assigned to you';
      case 'available':
        return 'No available tickets';
      default:
        return 'No tickets found';
    }
  };

  const getLoadingMessage = () => {
    switch (type) {
      case 'my-tickets':
        return 'Loading your tickets...';
      case 'available':
        return 'Loading available tickets...';
      default:
        return 'Loading tickets...';
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            {type === 'my-tickets' && <TableHead>Status</TableHead>}
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={type === 'my-tickets' ? 6 : 5} className="text-center py-8">
                {getLoadingMessage()}
              </TableCell>
            </TableRow>
          ) : tickets?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={type === 'my-tickets' ? 6 : 5} className="text-center py-8">
                {getEmptyMessage()}
              </TableCell>
            </TableRow>
          ) : (
            tickets?.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{ticket.subject}</div>
                    <div className="text-sm text-muted-foreground">
                      {ticket.description?.substring(0, 100)}...
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{ticket.complaint_type}</Badge>
                </TableCell>
                <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                {type === 'my-tickets' && (
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                )}
                <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {type === 'my-tickets' && ticket.status !== 'resolved' && onReply && (
                      <Button
                        size="sm"
                        onClick={() => onReply(ticket)}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                    )}
                    {type === 'available' && onAssign && (
                      <Button
                        size="sm"
                        onClick={() => onAssign(ticket.id)}
                        disabled={isAssigning}
                      >
                        <User className="h-3 w-3 mr-1" />
                        Take
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CSTicketsTable;