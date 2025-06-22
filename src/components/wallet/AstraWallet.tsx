
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, TrendingUp, ArrowUpRight, ArrowDownLeft, RefreshCw, Plus } from 'lucide-react';
import { useAstraToken } from '@/hooks/useAstraToken';
import { useAuth } from '@/contexts/AuthContext';
import { formatAstraAmount } from '@/lib/web3';

interface AstraWalletProps {
  balance?: number;
  transactions?: any[];
  onAddFunds?: () => void;
  showAddFunds?: boolean;
  compact?: boolean;
}

const AstraWallet: React.FC<AstraWalletProps> = ({
  balance: propBalance,
  transactions: propTransactions,
  onAddFunds,
  showAddFunds = true,
  compact = false
}) => {
  const { user, profile } = useAuth();
  const { balance, transactions, isLoading, fetchBalance, fetchTransactions } = useAstraToken();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const displayBalance = propBalance !== undefined ? propBalance : balance;
  const displayTransactions = propTransactions || transactions;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchBalance();
      await fetchTransactions();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatAstraPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'payment':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'signup_bonus':
      case 'profile_completion':
      case 'daily_checkin':
      case 'received':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      default:
        return <Coins className="h-4 w-4 text-orange-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'payment':
        return 'text-red-600';
      case 'signup_bonus':
      case 'profile_completion':
      case 'daily_checkin':
      case 'received':
        return 'text-green-600';
      default:
        return 'text-orange-600';
    }
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Coins className="h-5 w-5 text-orange-500" />
            ASTRA Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {isLoading ? '...' : formatAstraPrice(displayBalance)} ASTRA
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              ≈ ${(displayBalance * 0.01).toFixed(2)} USD
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {showAddFunds && onAddFunds && (
                <Button size="sm" onClick={onAddFunds} className="flex-1">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Funds
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-orange-500" />
            ASTRA Wallet
          </CardTitle>
          <CardDescription>Your ASTRA token balance and transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 rounded-lg">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {isLoading ? '...' : formatAstraPrice(displayBalance)} ASTRA
            </div>
            <div className="text-lg text-muted-foreground mb-4">
              ≈ ${(displayBalance * 0.01).toFixed(2)} USD
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Balance
              </Button>
              {showAddFunds && onAddFunds && (
                <Button onClick={onAddFunds}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Funds
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Total Transactions</div>
              <div className="text-xl font-semibold">{displayTransactions.length}</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">This Month</div>
              <div className="text-xl font-semibold">
                {displayTransactions.filter(tx => {
                  const txDate = new Date(tx.created_at);
                  const now = new Date();
                  return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Account Status</div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>Your recent ASTRA token transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {displayTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
              <p className="text-sm">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayTransactions.slice(0, 10).map((transaction, index) => (
                <div key={transaction.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {transaction.description || `${transaction.transaction_type.replace('_', ' ')}`}
                      </div>
                      {transaction.property_title && (
                        <div className="text-sm text-muted-foreground">
                          Property: {transaction.property_title}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type.includes('purchase') || transaction.transaction_type.includes('payment') ? '-' : '+'}
                      {formatAstraPrice(transaction.amount)} ASTRA
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.status || 'Completed'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AstraWallet;
