
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, ShoppingBag, History, Building } from 'lucide-react';
import { useAstraToken } from '@/hooks/useAstraToken';
import AstraBalanceDisplay from './AstraBalanceDisplay';

const AstraDashboard = () => {
  const { balance, transactions, isLoading } = useAstraToken();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAstraAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSpent = transactions
    .filter(t => t.status.toLowerCase() === 'completed')
    .reduce((sum, t) => sum + t.amount_astra, 0);

  const completedPurchases = transactions.filter(
    t => t.status.toLowerCase() === 'completed'
  ).length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AstraBalanceDisplay variant="card" showRefresh />
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="font-medium">Total Spent</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatAstraAmount(totalSpent)} ASTRA
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              ≈ ${(totalSpent * 0.01).toFixed(2)} USD
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Properties Owned</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {completedPurchases}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Successful purchases
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Transaction History
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            My Portfolio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>
                Your ASTRA token transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading transactions...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No transactions found</p>
                  <p className="text-sm">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-orange-100">
                          <ShoppingBag className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {transaction.property_title || `Property #${transaction.property_id.slice(0, 8)}`}
                            </span>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(transaction.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-orange-600">
                          -{formatAstraAmount(transaction.amount_astra)} ASTRA
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ≈ ${(transaction.amount_astra * 0.01).toFixed(2)} USD
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Property Portfolio
              </CardTitle>
              <CardDescription>
                Properties you own through ASTRA purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedPurchases === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No properties in your portfolio</p>
                  <p className="text-sm">Purchase properties from the marketplace to see them here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions
                    .filter(t => t.status.toLowerCase() === 'completed')
                    .map((transaction) => (
                      <div key={transaction.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">
                            {transaction.property_title || `Property #${transaction.property_id.slice(0, 8)}`}
                          </h3>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Owned
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Purchase Price:</span>
                            <div className="font-medium text-orange-600">
                              {formatAstraAmount(transaction.amount_astra)} ASTRA
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Purchase Date:</span>
                            <div className="font-medium">
                              {formatDate(transaction.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AstraDashboard;
