
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, RefreshCw, ExternalLink, TrendingUp } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { toast } from 'sonner';

const TokenBalance = () => {
  const { isAuthenticated } = useAuth();
  const { isConnected, address } = useWallet();
  const { balance, isLoading, refresh } = useTokenBalance();

  const handleRefresh = async () => {
    try {
      refresh();
      toast.success('Balance refreshed');
    } catch (error) {
      toast.error('Failed to refresh balance');
    }
  };

  const formatBalance = (bal: string | null) => {
    if (!bal) return '0';
    const num = parseFloat(bal);
    return num.toFixed(2);
  };

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
          Your current ASTRA token holdings and wallet information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Balance Display */}
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            {isLoading ? '...' : formatBalance(balance)} ASTRA
          </div>
          <p className="text-sm text-muted-foreground mt-1">Available Balance</p>
          
          {/* USD Value */}
          <div className="mt-2 text-sm text-muted-foreground">
            ≈ ${(parseFloat(formatBalance(balance)) * 0.01).toFixed(2)} USD
          </div>
        </div>

        {/* Wallet Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Connection</span>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Not Connected"}
              </Badge>
            </div>
            {isConnected && address && (
              <p className="text-xs text-muted-foreground font-mono">
                {address.slice(0, 8)}...{address.slice(-6)}
              </p>
            )}
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Network</span>
              <Badge variant="outline">BSC Testnet</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Binance Smart Chain
            </p>
          </div>
        </div>

        {/* Token Information */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800 dark:text-blue-200">ASTRA Token Info</span>
          </div>
          <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <div className="flex justify-between">
              <span>Symbol:</span>
              <span className="font-medium">ASTRA</span>
            </div>
            <div className="flex justify-between">
              <span>Decimals:</span>
              <span className="font-medium">18</span>
            </div>
            <div className="flex justify-between">
              <span>Current Price:</span>
              <span className="font-medium">$0.01 USD</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading || !isConnected}
            variant="outline" 
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open('https://testnet.bscscan.com', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on BSCScan
          </Button>
        </div>

        {/* Help Text */}
        {!isConnected && (
          <div className="text-center text-sm text-muted-foreground p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
            Connect your wallet to view and manage your ASTRA tokens
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenBalance;
