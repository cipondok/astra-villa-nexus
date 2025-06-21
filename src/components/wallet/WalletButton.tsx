
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, User, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const WalletButton = () => {
  const { user, isAuthenticated } = useAuth();
  const { address, isConnected, astraBalance, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatBalance = (balance: string | null) => {
    if (!balance) return '0.00';
    return parseFloat(balance).toFixed(2);
  };

  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => toast.info('Please sign in first to access your ASTRA wallet')}
        size="sm"
        variant="outline"
      >
        <Wallet className="h-4 w-4 mr-2" />
        ASTRA Wallet
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        size="sm"
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connect ASTRA Wallet
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Coins className="h-3 w-3 mr-1" />
          {formatBalance(astraBalance)} ASTRA
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">{formatAddress(address)}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">ASTRA Wallet</p>
                <p className="text-xs text-muted-foreground">{formatAddress(address)}</p>
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <Coins className="h-3 w-3" />
                  {formatBalance(astraBalance)} ASTRA
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => window.open('/astra-marketplace', '_blank')}>
              <Coins className="h-4 w-4 mr-2" />
              ASTRA Marketplace
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => {
              navigator.clipboard.writeText(address);
              toast.success('Wallet address copied');
            }}>
              <User className="h-4 w-4 mr-2" />
              Copy Address
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => {
                disconnectWallet();
                toast.success('ASTRA wallet disconnected');
              }}
              className="text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return null;
};

export default WalletButton;
