
import { Button } from "@/components/ui/button";
import { Sun, Moon, Globe, Menu, User, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
      buy: "Buy",
      rent: "Rent",
      newProjects: "New Projects",
      vendors: "Vendors",
      about: "About",
      loginRegister: "Login / Register",
      dashboard: "Dashboard",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      myProperties: "My Properties",
      myListings: "My Listings",
      myServices: "My Services",
      adminPanel: "Admin Panel"
    },
    id: {
      buy: "Beli",
      rent: "Sewa",
      newProjects: "Proyek Baru",
      vendors: "Vendor",
      about: "Tentang",
      loginRegister: "Masuk / Daftar",
      dashboard: "Dashboard",
      profile: "Profil",
      settings: "Pengaturan",
      logout: "Keluar",
      myProperties: "Properti Saya",
      myListings: "Listing Saya",
      myServices: "Layanan Saya",
      adminPanel: "Panel Admin"
    }
  };

  const currentText = text[language];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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

  const getRoleSpecificMenuItems = () => {
    if (!profile) return [];

    switch (profile.role) {
      case 'property_owner':
        return [{ label: currentText.myProperties, route: '/dashboard/owner/properties' }];
      case 'agent':
        return [{ label: currentText.myListings, route: '/dashboard/agent/listings' }];
      case 'vendor':
        return [{ label: currentText.myServices, route: '/dashboard/vendor/services' }];
      case 'admin':
        return [{ label: currentText.adminPanel, route: '/dashboard/admin' }];
      default:
        return [];
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Astra Villa
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              {currentText.buy}
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              {currentText.rent}
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              {currentText.newProjects}
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              {currentText.vendors}
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
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
              className="hidden sm:flex items-center space-x-1"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="hidden sm:flex"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Auth Section */}
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                      <AvatarFallback className="text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium">
                      {profile.full_name || profile.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{profile.role.replace('_', ' ')}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
                    {currentText.dashboard}
                  </DropdownMenuItem>
                  {getRoleSpecificMenuItems().map((item, index) => (
                    <DropdownMenuItem key={index} onClick={() => navigate(item.route)}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    {currentText.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    {currentText.settings}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {currentText.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
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
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                {currentText.buy}
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                {currentText.rent}
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                {currentText.newProjects}
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                {currentText.vendors}
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                {currentText.about}
              </a>
              
              {!user || !profile ? (
                <div className="px-3 py-2">
                  <Button onClick={onLoginClick} className="w-full bg-gradient-to-r from-blue-600 to-orange-500">
                    {currentText.loginRegister}
                  </Button>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2 border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                      <AvatarFallback className="text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{profile.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground capitalize">{profile.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => navigate(getDashboardRoute())} className="w-full justify-start">
                    {currentText.dashboard}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/profile')} className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    {currentText.profile}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/settings')} className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    {currentText.settings}
                  </Button>
                  <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-red-600">
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
