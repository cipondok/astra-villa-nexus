import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { useAstraToken } from '@/hooks/useAstraToken';
import { format } from 'date-fns';

interface Transfer {
  id: string;
  sender_id: string;
  recipient_id: string;
  amount: number;
  transfer_fee: number;
  net_amount: number;
  status: string;
  message: string;
  created_at: string;
  sender?: { full_name: string; email: string };
  recipient?: { full_name: string; email: string };
}

interface AstraTransferHistoryProps {
  className?: string;
}

const AstraTransferHistory: React.FC<AstraTransferHistoryProps> = ({ className }) => {
  const { transfers, loadingTransfers, formatTokenAmount, user } = useAstraToken();

  if (loadingTransfers) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Transfer History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading transfer history...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transfers || transfers.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Transfer History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ArrowUpDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transfers yet</p>
            <p className="text-sm">Your token transfers will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTransferDirection = (transfer: Transfer) => {
    return transfer.sender_id === user?.id ? 'sent' : 'received';
  };

  const getTransferIcon = (direction: string) => {
    return direction === 'sent' ? (
      <ArrowUp className="h-4 w-4 text-destructive" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  const getTransferAmount = (transfer: Transfer, direction: string) => {
    if (direction === 'sent') {
      return -transfer.amount; // Show full amount sent (including fee)
    } else {
      return transfer.net_amount; // Show net amount received
    }
  };

  const getOtherParty = (transfer: Transfer, direction: string) => {
    const party = direction === 'sent' ? transfer.recipient : transfer.sender;
    return party?.full_name || party?.email || 'Unknown User';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Transfer History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transfers.map((transfer: Transfer) => {
            const direction = getTransferDirection(transfer);
            const amount = getTransferAmount(transfer, direction);
            const otherParty = getOtherParty(transfer, direction);
            
            return (
              <div
                key={transfer.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getTransferIcon(direction)}
                  <div>
                    <div className="font-medium">
                      {direction === 'sent' ? 'Sent to' : 'Received from'} {otherParty}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(transfer.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                    {transfer.message && (
                      <div className="text-xs text-muted-foreground mt-1">
                        "{transfer.message}"
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-medium ${amount > 0 ? 'text-primary' : 'text-destructive'}`}>
                    {amount > 0 ? '+' : ''}{formatTokenAmount(Math.abs(amount))} ASTRA
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={transfer.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {transfer.status}
                    </Badge>
                    {direction === 'sent' && transfer.transfer_fee > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Fee: {formatTokenAmount(transfer.transfer_fee)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {transfers.length >= 50 && (
            <div className="text-center text-sm text-muted-foreground pt-4">
              Showing last 50 transfers
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AstraTransferHistory;