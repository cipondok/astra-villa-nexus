import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, 
  Search, 
  Heart, 
  User, 
  Menu,
  X,
  Bell,
  Settings,
  MapPin,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileAppLayoutProps {
  children: React.ReactNode;
}

const MobileAppLayout = ({ children }: MobileAppLayoutProps) => {
  const { isMobile, deviceInfo } = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Mobile-first navigation items
  const bottomNavItems = [
    { icon: Home, label: 'Home', path: '/', active: location.pathname === '/' },
    { icon: Search, label: 'Search', path: '/search', active: location.pathname.includes('/search') },
    { icon: Heart, label: 'Saved', path: '/saved', active: location.pathname.includes('/saved') },
    { icon: User, label: 'Profile', path: user ? '/profile' : '/auth', active: location.pathname.includes('/profile') || location.pathname.includes('/auth') },
  ];

  const quickActions = [
    { icon: Phone, label: 'Call Agent', action: () => window.open('tel:+62812345678') },
    { icon: MessageCircle, label: 'WhatsApp', action: () => window.open('https://wa.me/62812345678') },
    { icon: Mail, label: 'Email', action: () => window.open('mailto:info@astravilla.com') },
  ];

  const menuItems = [
    { label: 'Buy Properties', path: '/dijual', icon: Home },
    { label: 'Rent Properties', path: '/disewa', icon: MapPin },
    { label: 'Services', path: '/services', icon: Settings },
    { label: '3D Showcase', path: '/3d-showcase', icon: Search },
    { label: 'Admin Dashboard', path: '/admin', icon: User },
  ];

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-app-layout min-h-screen bg-background relative">
      {/* Mobile Top Header - Compact */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="flex items-center justify-between px-3 h-12">
          {/* Logo - Smaller */}
          <div 
            className="flex items-center space-x-1.5 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <Home className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ASTRA Villa
            </span>
          </div>

          {/* Right Actions - Compact */}
          <div className="flex items-center space-x-1">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
              >
                <Bell className="h-3.5 w-3.5" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 rounded-full"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Optimized padding */}
      <main className="pb-16 min-h-[calc(100vh-3rem)]">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Compact */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 shadow-lg">
        <div className="grid grid-cols-4 h-14">
          {bottomNavItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "h-full flex flex-col items-center justify-center space-y-0.5 rounded-none border-0 text-xs",
                item.active 
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20" 
                  : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-transform",
                item.active && "scale-110"
              )} />
              <span className="text-xs font-medium">{item.label}</span>
              {item.active && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-b-full" />
              )}
            </Button>
          ))}
        </div>
      </nav>

      {/* Slide-out Menu */}
      <div className={cn(
        "fixed inset-0 z-[100] transition-transform duration-300 ease-in-out",
        isMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Panel - Compact */}
        <div className="absolute right-0 top-0 h-full w-72 max-w-[80vw] bg-white dark:bg-gray-900 shadow-2xl">
          {/* Menu Header - Smaller */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-base font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              className="w-7 h-7 p-0 rounded-full"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* User Profile Section - Compact */}
          {user && profile && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">{profile.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions - Compact */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-xs font-medium text-gray-500 mb-2">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="flex flex-col items-center space-y-0.5 h-auto p-2"
                  onClick={action.action}
                >
                  <action.icon className="h-3.5 w-3.5" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Menu Items - Compact */}
          <div className="p-3">
            <h3 className="text-xs font-medium text-gray-500 mb-2">Browse</h3>
            <div className="space-y-0.5">
              {menuItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-10 text-sm"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-3.5 w-3.5 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Settings & Support - Compact */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="space-y-0.5">
              <Button
                variant="ghost"
                className="w-full justify-start h-9 text-sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-3.5 w-3.5 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-9 text-sm"
                onClick={() => navigate('/support')}
              >
                <MessageCircle className="h-3.5 w-3.5 mr-2" />
                Support
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Compact (hide on search page) */}
      {!location.pathname.includes('/search') && (
        <Button
          className="fixed bottom-[4.5rem] right-3 z-40 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg border-0"
          onClick={() => navigate('/search')}
        >
          <Search className="h-4 w-4 text-white" />
        </Button>
      )}

      {/* AI Chat Bot - Bottom Right */}
      {!location.pathname.includes('/search') && (
        <Button
          className="fixed bottom-16 right-3 z-40 w-11 h-11 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg border-0"
          onClick={() => {/* Add chat bot functionality */}}
        >
          <MessageCircle className="h-4 w-4 text-white" />
        </Button>
      )}
    </div>
  );
};

export default MobileAppLayout;