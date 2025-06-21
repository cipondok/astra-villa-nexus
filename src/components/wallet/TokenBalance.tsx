
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Wallet } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { ASTRA_TOKEN_CONFIG } from '@/lib/web3';

const TokenBalance = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    astraBalance, 
    isLoading 
  } = useWallet();
  
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Balances
          </CardTitle>
          <CardDescription>
            Please sign in to view your token balances
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Balances
          </CardTitle>
          <CardDescription>
            Connect your wallet to view balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No wallet connected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Token Balances
        </CardTitle>
        <CardDescription>
          Your cryptocurrency and token holdings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2 mt-2"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2 mt-2"></div>
            </div>
          </div>
        ) : (
          <>
            {/* BNB Balance */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BNB</span>
                </div>
                <div>
                  <p className="font-medium">Binance Coin</p>
                  <p className="text-sm text-muted-foreground">Native Token</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {balance ? `${parseFloat(balance).toFixed(4)} BNB` : '0 BNB'}
                </p>
                <Badge variant="secondary" className="text-xs">
                  Chain Currency
                </Badge>
              </div>
            </div>

            {/* ASTRA Token Balance */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">ASTRA</span>
                </div>
                <div>
                  <p className="font-medium">ASTRA Token</p>
                  <p className="text-sm text-muted-foreground">
                    {ASTRA_TOKEN_CONFIG.testnet.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  {astraBalance ? `${parseFloat(astraBalance).toFixed(2)} ASTRA` : '0 ASTRA'}
                </p>
                <Badge variant="default" className="text-xs bg-gradient-to-r from-blue-500 to-purple-500">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Project Token
                </Badge>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded text-center">
                {address}
              </p>
            </div>

            {/* Token Info */}
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              <p>ASTRA Token Contract:</p>
              <p className="font-mono break-all">
                {ASTRA_TOKEN_CONFIG.testnet.address}
              </p>
              <p className="mt-1">
                Network: BSC Testnet (Chain ID: {ASTRA_TOKEN_CONFIG.testnet.chainId})
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenBalance;
