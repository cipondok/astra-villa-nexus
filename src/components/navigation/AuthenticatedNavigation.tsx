import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
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
  const { isAdmin: canAccessAdmin } = useAdminCheck();
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
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-14">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-1.5 sm:space-x-2 text-base sm:text-lg lg:text-base font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-5 lg:w-5" />
              <span className="hidden xs:inline">VillaAstra</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <NavigationMenu>
              <NavigationMenuList className="space-x-2 lg:space-x-3 xl:space-x-4">
                {/* Home */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="flex items-center space-x-1 px-2 lg:px-2.5 py-1.5 rounded-md text-xs lg:text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/')}
                  >
                    <Home className="h-3.5 w-3.5 lg:h-3.5 lg:w-3.5" />
                    <span className="whitespace-nowrap">{currentText.home}</span>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Properties Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center space-x-1 text-xs lg:text-xs px-2 lg:px-2.5 py-1.5">
                    <Search className="h-3.5 w-3.5 lg:h-3.5 lg:w-3.5" />
                    <span className="whitespace-nowrap">{currentText.browse}</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-40 lg:w-44 xl:w-48 p-1.5">
                      <NavigationMenuLink
                        className="block px-2 py-1.5 rounded-md text-xs lg:text-xs hover:bg-accent/50 cursor-pointer transition-all"
                        onClick={() => navigate('/dijual')}
                      >
                        {currentText.properties}
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        className="block px-2 py-1.5 rounded-md text-xs lg:text-xs hover:bg-accent/50 cursor-pointer transition-all"
                        onClick={() => navigate('/buy')}
                      >
                        {currentText.forSale}
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        className="block px-2 py-1.5 rounded-md text-xs lg:text-xs hover:bg-accent/50 cursor-pointer transition-all"
                        onClick={() => navigate('/rent')}
                      >
                        {currentText.forRent}
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        className="block px-2 py-1.5 rounded-md text-xs lg:text-xs hover:bg-accent/50 cursor-pointer transition-all"
                        onClick={() => navigate('/new-projects')}
                      >
                        {currentText.newProjects}
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        className="block px-2 py-1.5 rounded-md text-xs lg:text-xs hover:bg-accent/50 cursor-pointer transition-all"
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
                    <NavigationMenuTrigger className="flex items-center space-x-1 text-xs lg:text-xs px-2 lg:px-2.5 py-1.5">
                      <Building2 className="h-3.5 w-3.5 lg:h-3.5 lg:w-3.5" />
                      <span className="whitespace-nowrap">Properties</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-40 lg:w-44 xl:w-48 p-1.5">
                        <NavigationMenuLink
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs lg:text-xs hover:bg-accent/50 cursor-pointer transition-all"
                          onClick={() => navigate('/my-properties')}
                        >
                          <List className="h-3.5 w-3.5" />
                          <span>{currentText.myProperties}</span>
                        </NavigationMenuLink>
                        <NavigationMenuLink
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs lg:text-xs hover:bg-accent/50 cursor-pointer transition-all"
                          onClick={() => navigate('/add-property')}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>{currentText.addProperty}</span>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                {/* Admin (Role-based) */}
                {canAccessAdmin && (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className="flex items-center space-x-1 px-2 lg:px-2.5 py-1.5 rounded-md text-xs lg:text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                      onClick={() => navigate('/admin')}
                    >
                      <Shield className="h-3.5 w-3.5 lg:h-3.5 lg:w-3.5" />
                      <span className="whitespace-nowrap">{currentText.admin}</span>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggleSwitch />
            </div>
            
            {/* Language Toggle */}
            <div className="hidden sm:block">
              <LanguageToggleSwitch />
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 lg:h-8 lg:w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 lg:h-8 lg:w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-xs sm:text-sm lg:text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 sm:w-52 lg:w-48 backdrop-blur-md bg-background/70 border-border/30" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-xs sm:text-sm lg:text-xs truncate">
                      {profile?.full_name || user?.email}
                    </p>
                    {profile?.role && (
                      <Badge className={`text-[10px] sm:text-xs lg:text-[10px] w-fit ${getRoleBadgeColor(profile.role)}`}>
                        {profile.role.replace('_', ' ').toLowerCase()}
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator className="opacity-30" />
                {profile?.role === 'agent' ? (
                  <DropdownMenuItem onClick={() => navigate('/agent-dashboard')} className="text-xs sm:text-sm lg:text-xs">
                    <User className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-3.5 lg:w-3.5" />
                    <span>Agent Dashboard</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="text-xs sm:text-sm lg:text-xs">
                    <User className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-3.5 lg:w-3.5" />
                    <span>{currentText.profile}</span>
                  </DropdownMenuItem>
                )}
                {canAccessPropertyManagement && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/my-properties')} className="text-xs sm:text-sm lg:text-xs">
                      <List className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-3.5 lg:w-3.5" />
                      <span>{currentText.myProperties}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/add-property')} className="text-xs sm:text-sm lg:text-xs">
                      <Plus className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-3.5 lg:w-3.5" />
                      <span>{currentText.addProperty}</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate('/profile')} className="text-xs sm:text-sm lg:text-xs">
                  <Settings className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-3.5 lg:w-3.5" />
                  <span>{currentText.settings}</span>
                </DropdownMenuItem>
                {canAccessAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')} className="text-xs sm:text-sm lg:text-xs">
                    <Shield className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-3.5 lg:w-3.5" />
                    <span>{currentText.admin}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="opacity-30" />
                <DropdownMenuItem onClick={handleLogout} className="text-xs sm:text-sm lg:text-xs">
                  <LogOut className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-3.5 lg:w-3.5" />
                  <span>{currentText.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-1.5 h-8 w-8"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 mt-2">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-md text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {currentText.home}
              </button>
              <button
                onClick={() => { navigate('/dijual'); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-md text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {currentText.properties}
              </button>
              {canAccessPropertyManagement && (
                <>
                  <button
                    onClick={() => { navigate('/my-properties'); setIsMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {currentText.myProperties}
                  </button>
                  <button
                    onClick={() => { navigate('/add-property'); setIsMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {currentText.addProperty}
                  </button>
                </>
              )}
              {profile?.role === 'agent' && (
                <button
                  onClick={() => { navigate('/agent-dashboard'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm sm:text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Agent Dashboard
                </button>
              )}
              {canAccessAdmin && (
                <button
                  onClick={() => { navigate('/admin'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm sm:text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  {currentText.admin}
                </button>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex gap-2 px-3">
                <ThemeToggleSwitch />
                <LanguageToggleSwitch />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AuthenticatedNavigation;
