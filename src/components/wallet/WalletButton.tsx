
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, Link, ExternalLink } from 'lucide-react';
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
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { user, isAuthenticated } = useAuth();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnectWallet = () => {
    try {
      open();
    } catch (error) {
      console.error('Error opening wallet modal:', error);
      toast.error('Failed to open wallet connection');
    }
  };

  const handleLinkWallet = async () => {
    try {
      console.log('Linking wallet for user:', user?.id, 'address:', address);
      toast.success('Wallet linking feature will be implemented soon!');
    } catch (error) {
      console.error('Error linking wallet:', error);
      toast.error('Failed to link wallet. Please try again.');
    }
  };

  // Show for all users, not just authenticated ones
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

  if (isConnecting) {
    return (
      <Button size="sm" disabled>
        <Wallet className="h-4 w-4 mr-2 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          Connected
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
                <p className="text-sm font-medium">Wallet Connected</p>
                <p className="text-xs text-muted-foreground">{formatAddress(address)}</p>
                <p className="text-xs text-blue-600">BSC Testnet</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {isAuthenticated && (
              <>
                <DropdownMenuItem onClick={handleLinkWallet}>
                  <Link className="h-4 w-4 mr-2" />
                  Link to Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            <DropdownMenuItem onClick={() => open({ view: 'Account' })}>
              <ExternalLink className="h-4 w-4 mr-2" />
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
                toast.success('Wallet disconnected');
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
