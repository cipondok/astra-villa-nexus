
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Link } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
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
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { user, isAuthenticated } = useAuth();

  // Only show wallet button for authenticated users
  if (!isAuthenticated || !user) {
    return null;
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleLinkWallet = async () => {
    try {
      // Note: We'll implement wallet linking when WalletProvider is available
      console.log('Wallet linking feature will be implemented');
      toast.success('Wallet linking feature coming soon!');
    } catch (error) {
      console.error('Error linking wallet:', error);
      toast.error('Failed to link wallet. Please try again.');
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={() => open()}
        size="sm"
        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">{formatAddress(address || '')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">Wallet Connected</p>
            <p className="text-xs text-muted-foreground">{formatAddress(address || '')}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLinkWallet}>
          <Link className="h-4 w-4 mr-2" />
          Link to Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => open({ view: 'Account' })}>
          <Wallet className="h-4 w-4 mr-2" />
          Manage Wallet
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => disconnect()}
          className="text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletButton;
