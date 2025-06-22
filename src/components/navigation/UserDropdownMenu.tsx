
import React from "react";
import { User, LogOut, Settings, Shield, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface UserDropdownMenuProps {
  language: "en" | "id";
}

const UserDropdownMenu = ({ language }: UserDropdownMenuProps) => {
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const text = {
    en: {
      profile: "Profile",
      dashboard: "Dashboard", 
      wallet: "Wallet",
      settings: "Settings",
      admin: "Admin Panel",
      logout: "Sign Out",
      signIn: "Sign In"
    },
    id: {
      profile: "Profil",
      dashboard: "Dashboard",
      wallet: "Dompet", 
      settings: "Pengaturan",
      admin: "Panel Admin",
      logout: "Keluar",
      signIn: "Masuk"
    }
  };

  const currentText = text[language];

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return profile?.email?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!profile) return '/dashboard';
    
    switch (profile.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'agent':
        return '/dashboard/agent';
      case 'vendor':
        return '/dashboard/vendor';
      case 'property_owner':
        return '/dashboard/property-owner';
      case 'general_user':
      default:
        return '/dashboard/user';
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="flex items-center space-x-2"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-muted">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:block text-sm">{currentText.signIn}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 p-2 rounded-full">
          <Avatar className="h-8 w-8 ring-2 ring-border/20 hover:ring-primary/30 transition-all">
            <AvatarImage 
              src={profile?.avatar_url || undefined} 
              alt={profile?.full_name || user?.email || 'User'} 
            />
            <AvatarFallback className="text-sm bg-primary/10 text-primary">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-sm font-medium max-w-32 truncate">
            {profile?.full_name || user?.email?.split('@')[0] || 'User'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">
              {profile?.full_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            {profile?.role && (
              <p className="text-xs text-muted-foreground capitalize">
                {profile.role.replace('_', ' ')}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
          <User className="h-4 w-4 mr-2" />
          {currentText.dashboard}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/wallet')}>
          <Wallet className="h-4 w-4 mr-2" />
          {currentText.wallet}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <Settings className="h-4 w-4 mr-2" />
          {currentText.profile}
        </DropdownMenuItem>
        
        {profile?.role === 'admin' && (
          <DropdownMenuItem onClick={() => navigate('/dashboard/admin')}>
            <Shield className="h-4 w-4 mr-2" />
            {currentText.admin}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {currentText.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdownMenu;
