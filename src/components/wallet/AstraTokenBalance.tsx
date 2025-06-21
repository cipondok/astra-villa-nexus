
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Wallet } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';

const AstraTokenBalance = () => {
  const { isAuthenticated } = useAuth();
  const { astraBalance, isConnected, address } = useWallet();

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            ASTRA Token Balance
          </CardTitle>
          <CardDescription>Please sign in to view your token balance</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          ASTRA Token Balance
        </CardTitle>
        <CardDescription>
          Your current ASTRA token holdings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Balance Display */}
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {astraBalance || '0'} ASTRA
            </div>
            <p className="text-muted-foreground mt-1">Current Balance</p>
          </div>

          {/* Wallet Status */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">Wallet Status</span>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          {/* Connected Address */}
          {isConnected && address && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Wallet Connected
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-300 font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          )}

          {/* Token Value */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Token Value</span>
            </div>
            <span className="text-sm font-medium">$0.01 USD</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AstraTokenBalance;
