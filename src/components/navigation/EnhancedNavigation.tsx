import { Button } from "@/components/ui/button";
import { Sun, Moon, Globe, Menu, User, LogOut, Settings, Bell, Home } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface EnhancedNavigationProps {
  onLoginClick?: () => void;
  language: "en" | "id";
  onLanguageToggle: () => void;
  theme: string;
  onThemeToggle: () => void;
}

const EnhancedNavigation = ({ 
  onLoginClick,
  language, 
  onLanguageToggle, 
  theme, 
  onThemeToggle 
}: EnhancedNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const text = {
    en: {
      home: "Home",
      buy: "Buy",
      rent: "Rent",
      newProjects: "New Projects",
      vendors: "Vendors",
      about: "About",
      loginRegister: "Login / Register",
      dashboard: "Dashboard",
      profile: "Profile",
      settings: "Settings",
      notifications: "Notifications",
      logout: "Sign Out",
      myProperties: "My Properties",
      myListings: "My Listings",
      myServices: "My Services",
      adminPanel: "Admin Panel"
    },
    id: {
      home: "Beranda",
      buy: "Beli",
      rent: "Sewa",
      newProjects: "Proyek Baru",
      vendors: "Vendor",
      about: "Tentang",
      loginRegister: "Masuk / Daftar",
      dashboard: "Dashboard",
      profile: "Profil",
      settings: "Pengaturan",
      notifications: "Notifikasi",
      logout: "Keluar",
      myProperties: "Properti Saya",
      myListings: "Listing Saya",
      myServices: "Layanan Saya",
      adminPanel: "Panel Admin"
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
    return profile?.email?.charAt(0).toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleAlerts = () => {
    setAlertsOpen(!alertsOpen);
  };

  const getDashboardRoute = () => {
    if (!profile) return '/dashboard';
    
    switch (profile.role) {
      case 'property_owner':
        return '/dashboard/owner';
      case 'agent':
        return '/dashboard/agent';
      case 'vendor':
        return '/dashboard/vendor';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/dashboard';
    }
  };

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${theme === 'dark' 
        ? (isScrolled 
          ? 'bg-blue-titanium/70 dark:bg-blue-titanium-dark/70 backdrop-blur-md' 
          : 'bg-blue-titanium-light/95 dark:bg-blue-titanium/95 backdrop-blur-sm')
        : (isScrolled
          ? 'bg-blue-sky-transparent backdrop-blur-md'
          : 'bg-blue-sky-light-transparent backdrop-blur-sm')
      }
      border-b ${theme === 'dark' 
        ? 'border-blue-titanium/20 dark:border-blue-titanium-light/20'
        : 'border-blue-sky/30'
      }
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate('/')}
          >
            <h1 className={`text-2xl font-bold drop-shadow-md ${
              theme === 'dark' 
                ? 'text-white' 
                : 'text-white'
            }`}>
              Astra Villa
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')}
              className={`transition-colors font-medium drop-shadow-sm ${
                theme === 'dark'
                  ? 'text-white/90 hover:text-white'
                  : 'text-white/95 hover:text-white'
              }`}
            >
              {currentText.home}
            </button>
            <a href="#" className={`transition-colors font-medium drop-shadow-sm ${
              theme === 'dark'
                ? 'text-white/90 hover:text-white'
                : 'text-white/95 hover:text-white'
            }`}>
              {currentText.buy}
            </a>
            <a href="#" className={`transition-colors font-medium drop-shadow-sm ${
              theme === 'dark'
                ? 'text-white/90 hover:text-white'
                : 'text-white/95 hover:text-white'
            }`}>
              {currentText.rent}
            </a>
            <a href="#" className={`transition-colors font-medium drop-shadow-sm ${
              theme === 'dark'
                ? 'text-white/90 hover:text-white'
                : 'text-white/95 hover:text-white'
            }`}>
              {currentText.newProjects}
            </a>
            <a href="#" className={`transition-colors font-medium drop-shadow-sm ${
              theme === 'dark'
                ? 'text-white/90 hover:text-white'
                : 'text-white/95 hover:text-white'
            }`}>
              {currentText.vendors}
            </a>
            <a href="#" className={`transition-colors font-medium drop-shadow-sm ${
              theme === 'dark'
                ? 'text-white/90 hover:text-white'
                : 'text-white/95 hover:text-white'
            }`}>
              {currentText.about}
            </a>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLanguageToggle}
              className={`hidden sm:flex items-center space-x-1 ${
                theme === 'dark'
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-white/95 hover:text-white hover:bg-white/20'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className={`hidden sm:flex ${
                theme === 'dark'
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-white/95 hover:text-white hover:bg-white/20'
              }`}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {isAuthenticated && user && profile ? (
              <>
                {/* Notifications Alert Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAlerts}
                  className={`hidden sm:flex relative ${
                    theme === 'dark'
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-white/95 hover:text-white hover:bg-white/20'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                    2
                  </Badge>
                </Button>

                {/* Alert Dropdown */}
                {alertsOpen && (
                  <div className="absolute top-16 right-20 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {currentText.notifications}
                      </h3>
                      <div className="space-y-2">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">New property inquiry received</p>
                          <p className="text-xs text-blue-600 dark:text-blue-300">2 minutes ago</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <p className="text-sm text-green-800 dark:text-green-200">Property listing approved</p>
                          <p className="text-xs text-green-600 dark:text-green-300">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={`flex items-center space-x-2 p-2 ${
                      theme === 'dark'
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-white/95 hover:text-white hover:bg-white/20'
                    }`}>
                      <Avatar className="h-8 w-8 ring-2 ring-white/20">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                        <AvatarFallback className="text-sm bg-blue-titanium text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm font-medium">
                        {profile?.full_name || 'User'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {profile?.role.replace('_', ' ')}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/')}>
                      <Home className="h-4 w-4 mr-2" />
                      {currentText.home}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
                      <User className="h-4 w-4 mr-2" />
                      {currentText.dashboard}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard?tab=profile')}>
                      <User className="h-4 w-4 mr-2" />
                      {currentText.profile}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard?tab=settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      {currentText.settings}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard?tab=notifications')}>
                      <Bell className="h-4 w-4 mr-2" />
                      {currentText.notifications}
                      <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 text-xs">2</Badge>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {currentText.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center">
                <Button 
                  className={`backdrop-blur-sm ${
                    theme === 'dark'
                      ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                      : 'bg-blue-titanium/20 text-blue-titanium-dark border-blue-titanium/30 hover:bg-blue-titanium/30'
                  }`}
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
              className={`md:hidden ${
                theme === 'dark'
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-white/95 hover:text-white hover:bg-white/20'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden border-t border-white/20 ${
            theme === 'dark'
              ? 'bg-blue-titanium/95 dark:bg-blue-titanium-dark/95'
              : 'bg-blue-sky-light-transparent'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button 
                onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-md ${
                  theme === 'dark'
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-white/95 hover:text-white hover:bg-white/20'
                }`}
              >
                {currentText.home}
              </button>
              <a href="#" className={`block px-3 py-2 rounded-md ${
                theme === 'dark'
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-white/95 hover:text-white hover:bg-white/20'
              }`}>
                {currentText.buy}
              </a>
              <a href="#" className={`block px-3 py-2 rounded-md ${
                theme === 'dark'
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-white/95 hover:text-white hover:bg-white/20'
              }`}>
                {currentText.rent}
              </a>
              <a href="#" className={`block px-3 py-2 rounded-md ${
                theme === 'dark'
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-white/95 hover:text-white hover:bg-white/20'
              }`}>
                {currentText.newProjects}
              </a>
              <a href="#" className={`block px-3 py-2 rounded-md ${
                theme === 'dark'
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-white/95 hover:text-white hover:bg-white/20'
              }`}>
                {currentText.vendors}
              </a>
              <a href="#" className={`block px-3 py-2 rounded-md ${
                theme === 'dark'
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-white/95 hover:text-white hover:bg-white/20'
              }`}>
                {currentText.about}
              </a>
              
              {!isAuthenticated ? (
                <div className="px-3 py-2">
                  <Button onClick={onLoginClick} className={`w-full backdrop-blur-sm ${
                    theme === 'dark'
                      ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                      : 'bg-blue-titanium/20 text-blue-titanium-dark border-blue-titanium/30 hover:bg-blue-titanium/30'
                  }`}>
                    {currentText.loginRegister}
                  </Button>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2 border-t border-white/20 mt-2 pt-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <Avatar className="h-8 w-8 ring-2 ring-white/20">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                      <AvatarFallback className="text-sm bg-blue-titanium text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-white'
                      }`}>{profile?.full_name || 'User'}</p>
                      <p className={`text-xs capitalize ${
                        theme === 'dark' ? 'text-white/70' : 'text-white/70'
                      }`}>{profile?.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => { navigate(getDashboardRoute()); setIsMenuOpen(false); }} className={`w-full justify-start ${
                    theme === 'dark'
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-white/95 hover:text-white hover:bg-white/20'
                  }`}>
                    <User className="h-4 w-4 mr-2" />
                    {currentText.dashboard}
                  </Button>
                  <Button variant="ghost" onClick={() => { navigate('/dashboard?tab=notifications'); setIsMenuOpen(false); }} className={`w-full justify-start ${
                    theme === 'dark'
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-white/95 hover:text-white hover:bg-white/20'
                  }`}>
                    <Bell className="h-4 w-4 mr-2" />
                    {currentText.notifications}
                    <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 text-xs">2</Badge>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut} 
                    className="w-full justify-start text-red-200 hover:text-red-100 hover:bg-red-500/20"
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

      {/* Click outside to close alerts */}
      {alertsOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setAlertsOpen(false)}
        />
      )}
    </nav>
  );
};

export default EnhancedNavigation;
