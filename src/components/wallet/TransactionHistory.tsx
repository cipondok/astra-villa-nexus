
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatAstraAmount } from '@/lib/web3';

interface Transaction {
  id: string;
  hash: string;
  type: 'send' | 'receive';
  amount: string;
  from: string;
  to: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

const TransactionHistory = () => {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, you would fetch from blockchain or your API
      // For now, we'll show sample data
      const sampleTransactions: Transaction[] = [
        {
          id: '1',
          hash: '0x1234567890abcdef',
          type: 'receive',
          amount: '100.00',
          from: '0xabc123...',
          to: address,
          timestamp: new Date(Date.now() - 3600000),
          status: 'confirmed',
        },
        {
          id: '2',
          hash: '0xfedcba0987654321',
          type: 'send',
          amount: '25.50',
          from: address,
          to: '0xdef456...',
          timestamp: new Date(Date.now() - 7200000),
          status: 'confirmed',
        },
      ];
      
      setTransactions(sampleTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [address]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent ASTRA token transactions</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-4">💳</div>
            <p>No transactions found</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'}`}>
                    {tx.type === 'send' ? (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{tx.type}</span>
                      <Badge variant="outline" className={getStatusColor(tx.status)}>
                        {tx.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tx.type === 'send' ? 'To' : 'From'}: {formatAddress(tx.type === 'send' ? tx.to : tx.from)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tx.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${tx.type === 'send' ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.type === 'send' ? '-' : '+'}{tx.amount} ASTRA
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://bscscan.com/tx/${tx.hash}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
