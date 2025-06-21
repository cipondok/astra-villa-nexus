
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Link } from 'lucide-react';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const WalletButton = () => {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    isWalletLinked,
    connectWallet, 
    disconnectWallet, 
    linkWalletToProfile,
    formatAddress,
    connectors 
  } = useWeb3Auth();
  
  const { user, signOut } = useAuth();

  if (!isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            disabled={isConnecting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Choose Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {connectors.map((connector) => (
            <DropdownMenuItem
              key={connector.id}
              onClick={() => connectWallet(connector.id)}
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
          <Wallet className="h-4 w-4 mr-2" />
          {formatAddress(address!)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>Wallet Connected</span>
            <span className="text-xs text-muted-foreground font-normal">
              {formatAddress(address!)}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {user && !isWalletLinked && (
          <DropdownMenuItem onClick={linkWalletToProfile} className="cursor-pointer">
            <Link className="h-4 w-4 mr-2" />
            Link to Profile
          </DropdownMenuItem>
        )}
        
        {isWalletLinked && (
          <DropdownMenuItem disabled>
            <Link className="h-4 w-4 mr-2 text-green-600" />
            <span className="text-green-600">Linked to Profile</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
        
        {user && (
          <DropdownMenuItem onClick={signOut} className="cursor-pointer">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletButton;
