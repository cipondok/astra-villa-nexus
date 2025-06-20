
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Wallet } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

const TokenBalance = () => {
  const { isConnected, astraBalance, balance, isLoading } = useWallet();

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Token Balances
          </CardTitle>
          <CardDescription>
            Connect your wallet to view token balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Wallet not connected
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 animate-spin" />
            Loading Balances...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Token Balances
        </CardTitle>
        <CardDescription>
          Your current wallet balances
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ASTRA Token Balance */}
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AS</span>
            </div>
            <div>
              <div className="font-semibold">ASTRA Token</div>
              <div className="text-sm text-muted-foreground">Primary Utility Token</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-blue-600">
              {astraBalance ? `${parseFloat(astraBalance).toFixed(2)}` : '0.00'}
            </div>
            <Badge variant="secondary" className="text-xs">
              ASTRA
            </Badge>
          </div>
        </div>

        {/* BNB Balance */}
        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">BNB</span>
            </div>
            <div>
              <div className="font-semibold">BNB</div>
              <div className="text-sm text-muted-foreground">BSC Native Token</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-yellow-600">
              {balance ? `${parseFloat(balance).toFixed(4)}` : '0.0000'}
            </div>
            <Badge variant="secondary" className="text-xs">
              BNB
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <div className="text-sm text-muted-foreground text-center">
            <TrendingUp className="h-4 w-4 inline mr-1" />
            Real-time balances from BSC
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenBalance;
