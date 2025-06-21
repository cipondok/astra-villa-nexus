
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Coins, User, Copy } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const WalletConnector = () => {
  const { isAuthenticated, user } = useAuth();
  const {
    isConnected,
    address,
    astraBalance,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatBalance = (balance: string | null) => {
    if (!balance) return '0.00';
    return parseFloat(balance).toFixed(2);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-orange-500" />
          ASTRA Wallet
        </CardTitle>
        <CardDescription>
          Your internal ASTRA token wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAuthenticated ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">Please sign in to access your ASTRA wallet</p>
            <Button disabled>
              <User className="h-4 w-4 mr-2" />
              Sign In Required
            </Button>
          </div>
        ) : !isConnected ? (
          <Button onClick={connectWallet} className="w-full">
            <Wallet className="h-4 w-4 mr-2" />
            Connect ASTRA Wallet
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Wallet Info */}
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Connected Wallet</span>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-1" />
                  Connected
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {formatAddress(address || '')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (address) {
                    navigator.clipboard.writeText(address);
                    toast.success('Address copied to clipboard');
                  }
                }}
                className="h-6 px-2 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>

            {/* ASTRA Balance */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">ASTRA Balance</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {formatBalance(astraBalance)}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-800">Account Linked</span>
              </div>
              <p className="text-xs text-blue-600">
                {user?.email || 'Unknown user'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => window.open('/astra-marketplace')}
                variant="outline"
                className="flex-1"
              >
                <Coins className="h-4 w-4 mr-2" />
                Marketplace
              </Button>
              <Button onClick={disconnectWallet} variant="outline" className="flex-1">
                <Wallet className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnector;
