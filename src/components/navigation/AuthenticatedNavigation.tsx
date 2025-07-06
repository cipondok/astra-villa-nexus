import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LanguageToggleSwitch from "@/components/LanguageToggleSwitch";
import ThemeToggleSwitch from "@/components/ThemeToggleSwitch";
import { 
  User, 
  LogOut, 
  Settings, 
  Shield, 
  Home, 
  Building2, 
  Search, 
  Plus,
  List,
  MessageSquare,
  Bell
} from "lucide-react";

interface AuthenticatedNavigationProps {
  language: "en" | "id";
  onLanguageToggle: () => void;
  theme: string;
  onThemeToggle: () => void;
}

const AuthenticatedNavigation = ({ 
  language, 
  onLanguageToggle, 
  theme, 
  onThemeToggle 
}: AuthenticatedNavigationProps) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'agent':
        return 'bg-blue-100 text-blue-800';
      case 'property_owner':
        return 'bg-green-100 text-green-800';
      case 'vendor':
        return 'bg-purple-100 text-purple-800';
      case 'customer_service':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canAccessPropertyManagement = profile?.role && 
    ['property_owner', 'agent', 'admin'].includes(profile.role);

  const canAccessAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

  const text = {
    en: {
      home: "Home",
      properties: "Properties",
      myProperties: "My Properties",
      addProperty: "Add Property",
      browse: "Browse",
      forSale: "For Sale",
      forRent: "For Rent",
      newProjects: "New Projects",
      preLaunching: "Pre-launching",
      dashboard: "Dashboard",
      admin: "Admin",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      welcome: "Welcome"
    },
    id: {
      home: "Beranda",
      properties: "Properti",
      myProperties: "Properti Saya",
      addProperty: "Tambah Properti",
      browse: "Jelajahi",
      forSale: "Dijual",
      forRent: "Disewa",
      newProjects: "Proyek Baru",
      preLaunching: "Pra-launching",
      dashboard: "Dashboard",
      admin: "Admin",
      profile: "Profil",
      settings: "Pengaturan",
      logout: "Keluar",
      welcome: "Selamat datang"
    }
  };

  const currentText = text[language];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Building2 className="h-8 w-8" />
              <span>VillaAstra</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="space-x-6">
                {/* Home */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => navigate('/')}
                  >
                    <Home className="h-4 w-4" />
                    <span>{currentText.home}</span>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Properties Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center space-x-1">
                    <Search className="h-4 w-4" />
                    <span>{currentText.browse}</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-48 p-2">
                      <NavigationMenuLink
                        className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => navigate('/properties')}
                      >
                        {currentText.properties}
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => navigate('/buy')}
                      >
                        {currentText.forSale}
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => navigate('/rent')}
                      >
                        {currentText.forRent}
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => navigate('/new-projects')}
                      >
                        {currentText.newProjects}
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => navigate('/pre-launching')}
                      >
                        {currentText.preLaunching}
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Property Management (Role-based) */}
                {canAccessPropertyManagement && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4" />
                      <span>Properties</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-48 p-2">
                        <NavigationMenuLink
                          className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => navigate('/my-properties')}
                        >
                          <div className="flex items-center space-x-2">
                            <List className="h-4 w-4" />
                            <span>{currentText.myProperties}</span>
                          </div>
                        </NavigationMenuLink>
                        <NavigationMenuLink
                          className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => navigate('/add-property')}
                        >
                          <div className="flex items-center space-x-2">
                            <Plus className="h-4 w-4" />
                            <span>{currentText.addProperty}</span>
                          </div>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                {/* Admin (Role-based) */}
                {canAccessAdmin && (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                      onClick={() => navigate('/admin')}
                    >
                      <Shield className="h-4 w-4" />
                      <span>{currentText.admin}</span>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggleSwitch />
            
            {/* Language Toggle */}
            <LanguageToggleSwitch />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">
                      {profile?.full_name || user?.email}
                    </p>
                    {profile?.role && (
                      <Badge className={`text-xs w-fit ${getRoleBadgeColor(profile.role)}`}>
                        {profile.role.replace('_', ' ').toLowerCase()}
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{currentText.profile}</span>
                </DropdownMenuItem>
                {canAccessPropertyManagement && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/my-properties')}>
                      <List className="mr-2 h-4 w-4" />
                      <span>{currentText.myProperties}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/add-property')}>
                      <Plus className="mr-2 h-4 w-4" />
                      <span>{currentText.addProperty}</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{currentText.settings}</span>
                </DropdownMenuItem>
                {canAccessAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>{currentText.admin}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{currentText.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => navigate('/')}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {currentText.home}
              </button>
              <button
                onClick={() => navigate('/properties')}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {currentText.properties}
              </button>
              {canAccessPropertyManagement && (
                <>
                  <button
                    onClick={() => navigate('/my-properties')}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {currentText.myProperties}
                  </button>
                  <button
                    onClick={() => navigate('/add-property')}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {currentText.addProperty}
                  </button>
                </>
              )}
              {canAccessAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {currentText.admin}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AuthenticatedNavigation;
