import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Shield, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Hash,
  User,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionRecord {
  id: string;
  type: 'escrow' | 'deed' | 'token' | 'commission';
  hash: string;
  from: string;
  to?: string;
  amount?: string;
  propertyId: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  blockNumber?: number;
}

interface TransactionHistoryProps {
  transactions?: TransactionRecord[];
  isLoading?: boolean;
}

// Mock data for demonstration
const mockTransactions: TransactionRecord[] = [
  {
    id: '1',
    type: 'escrow',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    from: '0xBuyer123...abc',
    to: '0xSeller456...def',
    amount: '150,000 MATIC',
    propertyId: 'PROP-2024-001',
    status: 'confirmed',
    timestamp: new Date(Date.now() - 86400000),
    blockNumber: 52847392,
  },
  {
    id: '2',
    type: 'deed',
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
    from: '0xPlatform...xyz',
    propertyId: 'PROP-2024-002',
    status: 'confirmed',
    timestamp: new Date(Date.now() - 172800000),
    blockNumber: 52837291,
  },
  {
    id: '3',
    type: 'token',
    hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    from: '0xInvestor...789',
    amount: '5,000 MATIC (100 shares)',
    propertyId: 'PROP-2024-003',
    status: 'pending',
    timestamp: new Date(),
  },
  {
    id: '4',
    type: 'commission',
    hash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
    from: '0xEscrow...contract',
    to: '0xAgent...456',
    amount: '7,500 MATIC',
    propertyId: 'PROP-2024-001',
    status: 'confirmed',
    timestamp: new Date(Date.now() - 86400000),
    blockNumber: 52847395,
  },
];

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions = mockTransactions,
  isLoading = false,
}) => {
  const getTypeIcon = (type: TransactionRecord['type']) => {
    switch (type) {
      case 'escrow': return <Shield className="h-4 w-4" />;
      case 'deed': return <FileText className="h-4 w-4" />;
      case 'token': return <Hash className="h-4 w-4" />;
      case 'commission': return <LinkIcon className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: TransactionRecord['type']) => {
    switch (type) {
      case 'escrow': return 'Escrow Payment';
      case 'deed': return 'Deed Transfer';
      case 'token': return 'Token Purchase';
      case 'commission': return 'Commission';
    }
  };

  const getTypeColor = (type: TransactionRecord['type']) => {
    switch (type) {
      case 'escrow': return 'bg-primary/20 text-primary border-primary/30';
      case 'deed': return 'bg-accent/20 text-accent border-accent/30';
      case 'token': return 'bg-chart-1/20 text-chart-1 border-chart-1/30';
      case 'commission': return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
    }
  };

  const getStatusBadge = (status: TransactionRecord['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-gold-primary/10 text-gold-primary border-gold-primary/30">
            <Clock className="h-3 w-3 mr-1 animate-pulse" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            Failed
          </Badge>
        );
    }
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const openPolygonScan = (hash: string) => {
    window.open(`https://polygonscan.com/tx/${hash}`, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Transaction History
        </CardTitle>
        <CardDescription>
          Immutable blockchain records of all property transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getTypeColor(tx.type)}`}>
                      {getTypeIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-medium">{getTypeLabel(tx.type)}</p>
                      <p className="text-xs text-muted-foreground">
                        Property: {tx.propertyId}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(tx.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono">{shortenHash(tx.hash)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(tx.timestamp)}</span>
                  </div>
                  {tx.from && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>From: {tx.from}</span>
                    </div>
                  )}
                  {tx.amount && (
                    <div className="font-semibold text-foreground">
                      {tx.amount}
                    </div>
                  )}
                </div>

                {tx.blockNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Block #{tx.blockNumber.toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openPolygonScan(tx.hash)}
                      className="h-7 text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on PolygonScan
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
