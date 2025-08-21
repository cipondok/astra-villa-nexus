import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Sparkles, 
  BarChart3,
  Building2,
  Heart,
  MessageSquare,
  Bell
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";

const UserIconWithBadge = () => {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';
  const isAgent = profile?.role === 'agent';
  const isVendor = profile?.role === 'vendor';

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative w-10 h-10 p-0 rounded-lg bg-white/20 hover:bg-white/30 transition-all border border-white/30"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-semibold">
              {getUserInitials()}
            </span>
          </div>
          
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0" align="end">
        {/* User Profile Header */}
        <DropdownMenuLabel className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-semibold">
                {getUserInitials()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                {profile?.role?.replace('_', ' ') || 'User'}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Role-specific Quick Actions */}
        <div className="p-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            {isAdmin && (
              <>
                <button onClick={() => { navigate('/admin-dashboard'); setIsOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                  <Crown className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-medium">Admin Panel</span>
                </button>
                <button onClick={() => { navigate('/dijual'); setIsOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
                  <Building2 className="h-5 w-5 text-green-500" />
                  <span className="text-xs font-medium">Manage Properties</span>
                </button>
                <button onClick={() => { navigate('/users'); setIsOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors">
                  <User className="h-5 w-5 text-purple-500" />
                  <span className="text-xs font-medium">User Management</span>
                </button>
                <button onClick={() => { navigate('/analytics'); setIsOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  <span className="text-xs font-medium">Analytics</span>
                </button>
              </>
            )}

            {isAgent && (
              <>
                <button onClick={() => { navigate('/agent'); setIsOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
                  <User className="h-5 w-5 text-green-500" />
                  <span className="text-xs font-medium">Agent Hub</span>
                </button>
                <button onClick={() => { navigate('/listings'); setIsOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-medium">My Listings</span>
                </button>
              </>
            )}

            {isVendor && (
              <>
                <button onClick={() => { navigate('/vendor'); setIsOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors">
                  <Settings className="h-5 w-5 text-purple-500" />
                  <span className="text-xs font-medium">Vendor Panel</span>
                </button>
                <button onClick={() => { navigate('/services'); setIsOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-medium">My Services</span>
                </button>
              </>
            )}

            {!isAdmin && !isAgent && !isVendor && (
              <>
                <button onClick={() => { navigate('/dashboard/user'); setIsOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-medium">Dashboard</span>
                </button>
                <button onClick={() => { navigate('/saved'); setIsOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-xs font-medium">Saved</span>
                </button>
                <button onClick={() => { navigate('/search'); setIsOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
                  <Building2 className="h-5 w-5 text-green-500" />
                  <span className="text-xs font-medium">Browse</span>
                </button>
                <button onClick={() => { navigate('/notifications'); setIsOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  <span className="text-xs font-medium">Messages</span>
                </button>
              </>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Settings & Account */}
        <div className="p-1">
          <DropdownMenuItem 
            onClick={() => { navigate('/profile'); setIsOpen(false); }}
            className="flex items-center gap-2 p-3"
          >
            <Settings className="h-4 w-4" />
            <span>Account Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={handleSignOut}
            className="flex items-center gap-2 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserIconWithBadge;