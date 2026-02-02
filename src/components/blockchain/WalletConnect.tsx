import React, { useState } from 'react';
import { useWallet } from '@/lib/blockchain/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, ChevronDown, LogOut, ExternalLink, Copy, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface WalletConnectProps {
  variant?: 'default' | 'compact';
  showBalance?: boolean;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ 
  variant = 'default',
  showBalance = true 
}) => {
  const { 
    address, 
    isConnected, 
    isConnecting,
    connectors,
    connectWallet,
    disconnect,
    shortenAddress,
    formatBalance,
    isPolygon,
    isMainnet,
    switchToPolygon,
    isSwitchingChain,
  } = useWallet();

  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async (connectorId: string) => {
    try {
      await connectWallet(connectorId);
      toast.success('Wallet connected successfully');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.info('Wallet disconnected');
  };

  if (!isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2"
            disabled={isConnecting}
          >
            <Wallet className="h-4 w-4" />
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {connectors.map((connector) => (
            <DropdownMenuItem
              key={connector.uid}
              onClick={() => handleConnect(connector.id)}
              className="cursor-pointer"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {connector.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <div className={`h-2 w-2 rounded-full ${isPolygon ? 'bg-purple-500' : 'bg-yellow-500'}`} />
            {shortenAddress(address)}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleCopyAddress}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            Copy Address
          </DropdownMenuItem>
          {!isPolygon && (
            <DropdownMenuItem onClick={() => switchToPolygon()} disabled={isSwitchingChain}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Switch to Polygon
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet
          </CardTitle>
          <Badge variant={isPolygon ? 'default' : 'secondary'} className="text-xs">
            {isMainnet ? 'Polygon' : isPolygon ? 'Amoy Testnet' : 'Wrong Network'}
          </Badge>
        </div>
        <CardDescription className="font-mono text-sm">
          {shortenAddress(address)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {showBalance && (
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="font-semibold">{formatBalance()} MATIC</span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyAddress}
            className="flex-1"
          >
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            Copy
          </Button>
          {!isPolygon && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => switchToPolygon()}
              disabled={isSwitchingChain}
              className="flex-1"
            >
              Switch Network
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDisconnect}
            className="text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnect;
