import { Button } from "@/components/ui/button";
import { Sun, Moon, Globe, Menu, User, LogOut, Settings, Home, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
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

interface RoleBasedNavigationProps {
  onLoginClick: () => void;
  language: "en" | "id";
  onLanguageToggle: () => void;
  theme: string;
  onThemeToggle: () => void;
}

const RoleBasedNavigation = ({ 
  onLoginClick, 
  language, 
  onLanguageToggle, 
  theme, 
  onThemeToggle 
}: RoleBasedNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('RoleBasedNavigation - Auth state changed:', { 
      isAuthenticated,
      user: !!user, 
      profile: !!profile, 
      userEmail: user?.email,
      profileRole: profile?.role 
    });
  }, [isAuthenticated, user, profile]);

  const text = {
    en: {
      loginRegister: "Login / Register",
      dashboard: "Dashboard",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      myProperties: "My Properties",
      myListings: "My Listings",
      myServices: "My Services",
      adminPanel: "Admin Panel",
      vendorDashboard: "Vendor Dashboard",
      becomeVendor: "Become a Vendor",
      wallet: "Wallet"
    },
    id: {
      loginRegister: "Masuk / Daftar",
      dashboard: "Dashboard",
      profile: "Profil",
      settings: "Pengaturan",
      logout: "Keluar",
      myProperties: "Properti Saya",
      myListings: "Listing Saya",
      myServices: "Layanan Saya",
      adminPanel: "Panel Admin",
      vendorDashboard: "Dashboard Vendor",
      becomeVendor: "Jadi Vendor",
      wallet: "Dompet"
    }
  };

  const currentText = text[language];

  const handleSignOut = async () => {
    try {
      console.log('RoleBasedNavigation: Fast sign out initiated...');
      setIsMenuOpen(false);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleHomeClick = () => {
    console.log('Navigating to home page');
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!profile) return '/dashboard';
    
    switch (profile.role) {
      case 'property_owner':
        return '/dashboard/user';
      case 'agent':
        return '/dashboard/agent';
      case 'vendor':
        return '/vendor';
      case 'admin':
        return '/dashboard/admin';
      case 'general_user':
      default:
        return '/dashboard/user';
    }
  };

  const getRoleSpecificMenuItems = () => {
    if (!profile) return [];

    const baseItems = [];
    
    switch (profile.role) {
      case 'property_owner':
        baseItems.push({ label: currentText.myProperties, route: '/dashboard/owner/properties' });
        break;
      case 'agent':
        baseItems.push({ label: currentText.myListings, route: '/dashboard/agent/listings' });
        break;
      case 'vendor':
        // Vendors only get service-related features, no property access
        baseItems.push({ label: currentText.myServices, route: '/vendor' });
        break;
      case 'admin':
        baseItems.push({ label: currentText.adminPanel, route: '/dashboard/admin' });
        break;
      default:
        break;
    }

    // Add Villa Realty integration for non-vendor users only
    if (profile.role !== 'vendor') {
      baseItems.push({ label: 'Villa Realty', route: '/wallet' });
    }

    return baseItems;
  };

  const getVendorMenuItems = () => {
    if (!user) return [];
    
    if (profile?.role === 'vendor') {
      return [{ label: currentText.vendorDashboard, route: '/vendor' }];
    } else {
      return [{ label: currentText.becomeVendor, route: '/vendor/register' }];
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return profile?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 header-ios border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Clickable to go home */}
          <div 
            className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={handleHomeClick}
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-white/90 bg-clip-text text-transparent drop-shadow-lg">
              Astra Villa
            </h1>
          </div>

          {/* Desktop Navigation - Removed navigation links, kept only controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLanguageToggle}
              className="header-button-ios"
            >
              <Globe className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="header-button-ios"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Auth Section */}
            {isAuthenticated && user && profile ? (
              <>
                {/* Desktop User Menu */}
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="header-button-ios flex items-center space-x-2 p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                          <AvatarFallback className="text-sm bg-white/20 text-white border border-white/20">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden md:block text-sm font-medium text-white">
                          {profile.full_name || profile.email}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium text-gray-900">{profile.full_name || 'User'}</p>
                          <p className="text-xs text-gray-600">{profile.email}</p>
                          <p className="text-xs text-gray-600 capitalize">{profile.role.replace('_', ' ')}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="border-gray-200" />
                      <DropdownMenuItem onClick={() => navigate(getDashboardRoute())} className="text-gray-900 hover:bg-blue-50/80">
                        {currentText.dashboard}
                      </DropdownMenuItem>
                      {profile.role !== 'vendor' && (
                        <DropdownMenuItem onClick={() => navigate('/wallet')} className="text-gray-900 hover:bg-blue-50/80">
                          <Wallet className="h-4 w-4 mr-2" />
                          {currentText.wallet}
                        </DropdownMenuItem>
                      )}
                      {getRoleSpecificMenuItems().map((item, index) => (
                        <DropdownMenuItem key={index} onClick={() => navigate(item.route)} className="text-gray-900 hover:bg-blue-50/80">
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                      {getVendorMenuItems().map((item, index) => (
                        <DropdownMenuItem key={`vendor-${index}`} onClick={() => navigate(item.route)} className="text-gray-900 hover:bg-blue-50/80">
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="border-gray-200" />
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red-50/80">
                        <LogOut className="h-4 w-4 mr-2" />
                        {currentText.logout}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <Button 
                onClick={onLoginClick} 
                className="header-button-ios"
              >
                <User className="h-4 w-4 mr-2" />
                {currentText.loginRegister}
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="header-button-ios"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 shadow-2xl rounded-b-2xl">
            <div className="px-4 pt-4 pb-6 space-y-3">
              {/* Theme and Language toggles for mobile */}
              <div className="flex justify-between items-center p-3 border-b border-gray-200/50 bg-gray-50/50 rounded-xl">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLanguageToggle}
                  className="flex-1 mr-2 bg-white/70 hover:bg-white/90 text-gray-900 border border-gray-200/50 rounded-lg"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {language.toUpperCase()}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onThemeToggle}
                  className="flex-1 bg-white/70 hover:bg-white/90 text-gray-900 border border-gray-200/50 rounded-lg"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
              </div>

              {/* Auth Section for Mobile */}
              {isAuthenticated && user && profile ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 border-b border-border/30">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                        <AvatarFallback className="text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{profile.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate(getDashboardRoute());
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    {currentText.dashboard}
                  </Button>
                  
                  {profile.role !== 'vendor' && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate('/wallet');
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      {currentText.wallet}
                    </Button>
                  )}
                  
                  {getRoleSpecificMenuItems().map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      onClick={() => {
                        navigate(item.route);
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      {item.label}
                    </Button>
                  ))}
                  
                  {getVendorMenuItems().map((item, index) => (
                    <Button
                      key={`vendor-mobile-${index}`}
                      variant="ghost"
                      onClick={() => {
                        navigate(item.route);
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      {item.label}
                    </Button>
                  ))}
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {currentText.logout}
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    onLoginClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-start"
                  variant="ghost"
                >
                  <User className="h-4 w-4 mr-2" />
                  {currentText.loginRegister}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;
