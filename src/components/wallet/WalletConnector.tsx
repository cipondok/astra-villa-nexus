
import React from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Link, Unlink, ExternalLink } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const WalletConnector = () => {
  const { open } = useWeb3Modal();
  const { isAuthenticated } = useAuth();
  const {
    isConnected,
    address,
    balance,
    astraBalance,
    isLoading,
    disconnectWallet,
    linkWalletToProfile,
    isWalletLinked,
  } = useWallet();

  const handleLinkWallet = async () => {
    try {
      await linkWalletToProfile();
      toast.success('Wallet linked successfully!');
    } catch (error) {
      console.error('Error linking wallet:', error);
      toast.error('Failed to link wallet. Please try again.');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connection
        </CardTitle>
        <CardDescription>
          Connect your wallet to access ASTRA token features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <Button onClick={() => open()} className="w-full">
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Wallet Info */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Connected Wallet</span>
                <Badge variant="outline" className="text-green-600">
                  Connected
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatAddress(address || '')}
              </div>
            </div>

            {/* Balances */}
            {isLoading ? (
              <div className="text-center text-sm text-muted-foreground">
                Loading balances...
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>BNB Balance:</span>
                  <span className="font-medium">
                    {balance ? `${parseFloat(balance).toFixed(4)} BNB` : '0 BNB'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ASTRA Balance:</span>
                  <span className="font-medium text-blue-600">
                    {astraBalance ? `${parseFloat(astraBalance).toFixed(2)} ASTRA` : '0 ASTRA'}
                  </span>
                </div>
              </div>
            )}

            {/* Link to Profile */}
            {isAuthenticated && (
              <div className="space-y-2">
                {!isWalletLinked ? (
                  <Button onClick={handleLinkWallet} variant="outline" className="w-full">
                    <Link className="h-4 w-4 mr-2" />
                    Link to Profile
                  </Button>
                ) : (
                  <div className="flex items-center justify-center text-sm text-green-600">
                    <Link className="h-4 w-4 mr-1" />
                    Linked to Profile
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => open({ view: 'Account' })}
                variant="outline"
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage
              </Button>
              <Button onClick={disconnectWallet} variant="outline" className="flex-1">
                <Unlink className="h-4 w-4 mr-2" />
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
