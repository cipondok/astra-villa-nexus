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
        return '/dashboard/vendor';
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
        baseItems.push({ label: currentText.myServices, route: '/dashboard/vendor' });
        break;
      case 'admin':
        baseItems.push({ label: currentText.adminPanel, route: '/dashboard/admin' });
        break;
      default:
        break;
    }

    // Add Villa Realty integration for all authenticated users
    baseItems.push({ label: 'Villa Realty', route: '/wallet' });

    return baseItems;
  };

  const getVendorMenuItems = () => {
    if (!user) return [];
    
    if (profile?.role === 'vendor') {
      return [{ label: currentText.vendorDashboard, route: '/dashboard/vendor' }];
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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-ios border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Clickable to go home */}
          <div 
            className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={handleHomeClick}
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-ios-blue to-ios-blue/80 bg-clip-text text-transparent">
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
              className="glass-ios border border-border/30 text-foreground hover:bg-ios-blue/10 hover:text-ios-blue hover:border-ios-blue/30"
            >
              <Globe className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="glass-ios border border-border/30 text-foreground hover:bg-ios-blue/10 hover:text-ios-blue hover:border-ios-blue/30"
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
                      <Button variant="ghost" className="flex items-center space-x-2 p-2 glass-ios border border-border/30 hover:bg-ios-blue/10 hover:border-ios-blue/30">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                          <AvatarFallback className="text-sm bg-ios-blue/10 text-ios-blue border border-ios-blue/20">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden md:block text-sm font-medium text-foreground">
                          {profile.full_name || profile.email}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass-ios border border-border/30">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium text-foreground">{profile.full_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{profile.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">{profile.role.replace('_', ' ')}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="border-border/30" />
                      <DropdownMenuItem onClick={() => navigate(getDashboardRoute())} className="text-foreground hover:bg-ios-blue/10">
                        {currentText.dashboard}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/wallet')} className="text-foreground hover:bg-ios-blue/10">
                        <Wallet className="h-4 w-4 mr-2" />
                        {currentText.wallet}
                      </DropdownMenuItem>
                      {getRoleSpecificMenuItems().map((item, index) => (
                        <DropdownMenuItem key={index} onClick={() => navigate(item.route)} className="text-foreground hover:bg-ios-blue/10">
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                      {getVendorMenuItems().map((item, index) => (
                        <DropdownMenuItem key={`vendor-${index}`} onClick={() => navigate(item.route)} className="text-foreground hover:bg-ios-blue/10">
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="border-border/30" />
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red-50">
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
                className="glass-ios border border-border/30 text-foreground hover:bg-ios-blue/10 hover:text-ios-blue hover:border-ios-blue/30"
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
              className="glass-ios border border-border/30"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 glass-ios border-t border-border/30 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Theme and Language toggles for mobile */}
              <div className="flex justify-between items-center p-2 border-b border-border/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLanguageToggle}
                  className="flex-1 mr-2"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {language.toUpperCase()}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onThemeToggle}
                  className="flex-1"
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
