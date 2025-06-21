
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, CheckCircle, Settings, RefreshCw } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { astraTokenAPI, TokenBalance } from '@/services/astraTokenAPI';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const EnhancedWalletButton = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { isAuthenticated } = useAuth();
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const loadTokenBalance = async () => {
    if (!address || !astraTokenAPI.isConfigured()) return;

    setIsLoadingBalance(true);
    try {
      const balance = await astraTokenAPI.getBalance(address);
      setTokenBalance(balance);
    } catch (error) {
      console.error('Error loading token balance:', error);
      toast.error('Failed to load ASTRA balance');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      loadTokenBalance();
    }
  }, [isConnected, address]);

  const handleConnectWallet = () => {
    if (!astraTokenAPI.isConfigured()) {
      toast.error('Please configure ASTRA Token API first');
      return;
    }
    
    try {
      open();
    } catch (error) {
      console.error('Error opening wallet modal:', error);
      toast.error('Failed to open wallet connection');
    }
  };

  // Show configuration needed message if API not configured
  if (!astraTokenAPI.isConfigured()) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <Settings className="h-8 w-8 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">ASTRA Token Not Configured</p>
              <p className="text-sm text-muted-foreground">
                Configure your token API to enable wallet features
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/dashboard/admin', '_blank')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Connection button
  if (!isConnected && !isConnecting) {
    return (
      <Button
        onClick={handleConnectWallet}
        size="sm"
        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  // Connecting state
  if (isConnecting) {
    return (
      <Button size="sm" disabled>
        <Wallet className="h-4 w-4 mr-2 animate-spin" />
        Connecting...
      </Button>
    );
  }

  // Connected state
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Connected
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">{formatAddress(address)}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Wallet Connected</p>
                <p className="text-xs text-muted-foreground">{formatAddress(address)}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* ASTRA Balance */}
            <div className="p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">ASTRA Balance</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={loadTokenBalance}
                  disabled={isLoadingBalance}
                >
                  <RefreshCw className={`h-3 w-3 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {isLoadingBalance ? '...' : tokenBalance ? `${tokenBalance.balance} ${tokenBalance.symbol}` : 'N/A'}
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => open({ view: 'Account' })}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Wallet
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => window.open('/wallet', '_blank')}>
              <Wallet className="h-4 w-4 mr-2" />
              ASTRA Dashboard
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => {
                disconnect();
                setTokenBalance(null);
                toast.success('Wallet disconnected');
              }}
              className="text-red-600 hover:bg-red-50"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return null;
};

export default EnhancedWalletButton;
