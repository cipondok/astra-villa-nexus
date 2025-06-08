import { Button } from "@/components/ui/button";
import { Sun, Moon, Globe, Menu, User, LogOut, Settings, Home } from "lucide-react";
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
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('RoleBasedNavigation - Auth state changed:', { 
      user: !!user, 
      profile: !!profile, 
      userEmail: user?.email,
      profileRole: profile?.role 
    });
  }, [user, profile]);

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
      becomeVendor: "Become a Vendor"
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
      becomeVendor: "Jadi Vendor"
    }
  };

  const currentText = text[language];

  const handleSignOut = async () => {
    try {
      console.log('Signing out user...');
      await signOut();
      navigate('/');
      setIsMenuOpen(false);
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

    switch (profile.role) {
      case 'property_owner':
        return [{ label: currentText.myProperties, route: '/dashboard/owner/properties' }];
      case 'agent':
        return [{ label: currentText.myListings, route: '/dashboard/agent/listings' }];
      case 'vendor':
        return [{ label: currentText.myServices, route: '/dashboard/vendor' }];
      case 'admin':
        return [{ label: currentText.adminPanel, route: '/dashboard/admin' }];
      default:
        return [];
    }
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
            {user && profile ? (
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
                      <DropdownMenuItem onClick={() => navigate('/profile')} className="text-foreground hover:bg-ios-blue/10">
                        <User className="h-4 w-4 mr-2" />
                        {currentText.profile}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')} className="text-foreground hover:bg-ios-blue/10">
                        <Settings className="h-4 w-4 mr-2" />
                        {currentText.settings}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="border-border/30" />
                      <DropdownMenuItem onClick={handleSignOut} className="text-ios-red hover:bg-ios-red/10">
                        <LogOut className="h-4 w-4 mr-2" />
                        {currentText.logout}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Quick Logout Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-ios-red hover:text-ios-red/80 hover:bg-ios-red/10 border-ios-red/30 glass-ios"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{currentText.logout}</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center">
                <Button 
                  variant="ios"
                  onClick={onLoginClick}
                >
                  {currentText.loginRegister}
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden glass-ios border border-border/30 text-foreground hover:bg-ios-blue/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLanguageToggle}
              className="glass-ios border border-border/30 text-foreground hover:bg-ios-blue/10"
            >
              <Globe className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="glass-ios border border-border/30 text-foreground hover:bg-ios-blue/10"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Auth Button or User Menu */}
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-2 glass-ios border border-border/30">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                      <AvatarFallback className="text-sm bg-ios-blue/10 text-ios-blue">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
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
                  {getVendorMenuItems().map((item, index) => (
                    <DropdownMenuItem key={`vendor-mobile-${index}`} onClick={() => navigate(item.route)} className="text-foreground hover:bg-ios-blue/10">
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="text-foreground hover:bg-ios-blue/10">
                    <User className="h-4 w-4 mr-2" />
                    {currentText.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-ios-red hover:bg-ios-red/10">
                    <LogOut className="h-4 w-4 mr-2" />
                    {currentText.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ios"
                size="sm"
                onClick={onLoginClick}
              >
                {currentText.loginRegister}
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="glass-ios border border-border/30 text-foreground hover:bg-ios-blue/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Simplified */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/30 glass-ios">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {!user || !profile ? (
                <div className="px-3 py-2">
                  <Button onClick={onLoginClick} variant="ios" className="w-full">
                    {currentText.loginRegister}
                  </Button>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2 border-t border-border/30 mt-2 pt-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                      <AvatarFallback className="text-sm bg-ios-blue/10 text-ios-blue">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{profile.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground capitalize">{profile.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => navigate(getDashboardRoute())} className="w-full justify-start text-foreground hover:bg-ios-blue/10">
                    {currentText.dashboard}
                  </Button>
                  {getVendorMenuItems().map((item, index) => (
                    <Button key={`vendor-mobile-nav-${index}`} variant="ghost" onClick={() => navigate(item.route)} className="w-full justify-start text-foreground hover:bg-ios-blue/10">
                      {item.label}
                    </Button>
                  ))}
                  <Button variant="ghost" onClick={() => navigate('/profile')} className="w-full justify-start text-foreground hover:bg-ios-blue/10">
                    <User className="h-4 w-4 mr-2" />
                    {currentText.profile}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/settings')} className="w-full justify-start text-foreground hover:bg-ios-blue/10">
                    <Settings className="h-4 w-4 mr-2" />
                    {currentText.settings}
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut} 
                    className="w-full justify-start text-ios-red hover:bg-ios-red/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {currentText.logout}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;
