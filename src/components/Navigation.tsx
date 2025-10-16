
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, Settings, LogOut, Crown, Moon, Sun, Sparkles, Brain, Home as HomeIcon, Building, Key, Rocket, Hammer, BarChart3, Headphones, Box, Settings2, Bell, Coins, ChevronDown, TrendingUp, Plus, List } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import LanguageToggleSwitch from "./LanguageToggleSwitch";
import EnhancedAuthModal from "./auth/EnhancedAuthModal";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";
import UserIconWithBadge from "./ui/UserIconWithBadge";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Handle scroll effect with throttling for better performance
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 0;
          setScrolled(isScrolled);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const text = {
    en: {
      home: "Home",
      services: "Services",
      admin: "Admin",
      signIn: "Sign In",
      signOut: "Sign Out",
      user: "User",
      adminPanel: "Admin Panel",
      settings: "Settings",
      properties: "All Properties",
      saved: "Saved",
      messages: "Messages",
      buyProperties: "Buy Properties",
      rentProperties: "Rent Properties",
      preLaunch: "Pre Launch",
      newProjects: "New Projects",
      profile: "Profile",
      dashboard: "Dashboard",
      csDashboard: "CS Dashboard"
    },
    id: {
      home: "Beranda",
      services: "Layanan",
      admin: "Admin",
      signIn: "Masuk",
      signOut: "Keluar",
      user: "Pengguna",
      adminPanel: "Panel Admin",
      settings: "Pengaturan",
      properties: "Semua Properti",
      saved: "Disimpan",
      messages: "Pesan",
      buyProperties: "Dijual",
      rentProperties: "Disewa",
      preLaunch: "Pra Peluncuran",
      newProjects: "Proyek Baru",
      profile: "Profil",
      dashboard: "Dashboard",
      csDashboard: "Dashboard CS"
    }
  };

  const currentText = text[language] || text.en;

  // Property navigation items
  const propertyNavItems = [
    { 
      icon: Building, 
      label: currentText.buyProperties, 
      path: '/dijual',
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      icon: Key, 
      label: currentText.rentProperties, 
      path: '/disewa',
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      icon: Rocket, 
      label: currentText.preLaunch, 
      path: '/pre-launching',
      color: 'text-purple-600 dark:text-purple-400'
    },
    { 
      icon: Hammer, 
      label: currentText.newProjects, 
      path: '/new-projects',
      color: 'text-orange-600 dark:text-orange-400'
    },
    { 
      icon: Box, 
      label: '3D Showcase', 
      path: '/3d-showcase',
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  const isAgent = profile?.role === 'agent';
  
  // Debug admin access
  console.log('🔍 Navigation Debug:', {
    userEmail: user?.email, 
    profileRole: profile?.role, 
    isAdmin,
    showingAdminButton: isAdmin 
  });

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-[10000] header-ios border-b border-white/10 backdrop-blur-xl shadow-lg transform-gpu will-change-transform animate-fade-in">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12 gap-2">
            {/* Enhanced ASTRA Villa Logo with Animation */}
            <div 
              className="flex items-center space-x-2 cursor-pointer group flex-shrink-0" 
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Brain className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div className="hidden sm:flex items-center space-x-1">
                <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-300 bg-clip-text text-transparent drop-shadow-lg group-hover:scale-105 transition-transform duration-300">ASTRA</span>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-lg group-hover:scale-105 transition-transform duration-300">Villa</span>
              </div>
            </div>

            {/* Enhanced Desktop Navigation - Main Menu */}
            <div className="hidden xl:flex items-center gap-1 flex-1 justify-center max-w-5xl">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-10 px-3 text-sm font-medium text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 hover:scale-105 rounded-xl transition-all duration-200"
                onClick={() => navigate('/')}
              >
                <HomeIcon className="h-3.5 w-3.5 xl:mr-1.5" />
                <span className="hidden xl:inline text-xs">{currentText.home}</span>
              </Button>

              {/* Enhanced Property Navigation Items - Icon Only */}
              {propertyNavItems.map((item, index) => (
                <div key={item.path} className="relative group">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-10 w-10 p-0 hover:bg-white/10 hover:scale-105 rounded-xl transition-all duration-200 text-gray-900 dark:text-white/90"
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                  </Button>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-[10001] shadow-lg">
                    {item.label}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/90"></div>
                  </div>
                </div>
              ))}

              <div className="relative group">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 w-10 p-0 hover:bg-white/10 hover:scale-105 rounded-xl transition-all duration-200 text-gray-900 dark:text-white/90"
                  onClick={() => navigate('/services')}
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-[10001] shadow-lg">
                  {currentText.services}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/90"></div>
                </div>
              </div>

              {/* Add Property Button */}
              <Button 
                size="sm"
                onClick={() => navigate('/add-property')}
                className="h-10 px-4 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 rounded-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Property
              </Button>

              {/* Investment Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-10 px-3 text-sm font-medium text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 hover:scale-105 rounded-xl transition-all duration-200"
                  >
                    <TrendingUp className="h-4 w-4 xl:mr-1.5" />
                    <span className="hidden xl:inline text-xs">Investment</span>
                    <ChevronDown className="h-3 w-3 ml-1 hidden xl:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl z-[10001]">
                  <DropdownMenuItem 
                    onClick={() => navigate('/foreign-investment')}
                    className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Foreign Investment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>


               {/* Dashboard link - show role-appropriate dashboard */}
               {user && !isAdmin && !isAgent && (
                 <Button 
                   variant="ghost" 
                   size="sm"
                   className="h-10 px-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                   onClick={() => navigate('/dashboard/user')}
                 >
                   <BarChart3 className="h-4 w-4 xl:mr-1" />
                   <span className="hidden xl:inline">Dashboard</span>
                 </Button>
               )}

              {/* Agent Dashboard - only show for agent users */}
              {isAgent && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 px-2.5 text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                  onClick={() => navigate('/agent')}
                >
                  <User className="h-4 w-4 xl:mr-1" />
                  <span className="hidden xl:inline">Agent</span>
                </Button>
              )}

              {/* Vendor Dashboard - only show for vendor users */}
              {profile?.role === 'vendor' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 px-2.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                  onClick={() => navigate('/vendor')}
                >
                  <Settings className="h-4 w-4 xl:mr-1" />
                  <span className="hidden xl:inline">Vendor</span>
                </Button>
              )}

              {/* Admin Panel - only show for admin users */}
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 px-2.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                  onClick={() => navigate('/admin-dashboard')}
                >
                  <Crown className="h-4 w-4 xl:mr-1" />
                  <span className="hidden xl:inline">Admin</span>
                </Button>
              )}
            </div>

            {/* Enhanced Right Section - Compact Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Enhanced Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-9 h-9 p-0 rounded-xl bg-white/20 hover:bg-white/30 hover:scale-105 transition-all duration-200 border border-white/30 text-gray-900 dark:text-white shadow-lg"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>

              {/* Enhanced Language Toggle - Hidden on mobile */}
              <div className="hidden lg:block">
                <LanguageToggleSwitch />
              </div>

              {/* Enhanced Notification Dropdown - only show for authenticated users */}
              {user && <NotificationDropdown />}

              {/* Enhanced User Section with Stats and Badges */}
              {user ? (
                <UserIconWithBadge onNavigate={(path) => navigate(path)} />
              ) : (
                <div className="relative group">
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    variant="ghost"
                    size="sm"
                    className="w-9 h-9 p-0 rounded-xl bg-white/20 hover:bg-white/30 hover:scale-105 transition-all duration-200 border border-white/30 text-gray-900 dark:text-white shadow-lg"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-[10001] shadow-lg">
                    {currentText.signIn}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/90"></div>
                  </div>
                </div>
              )}

              {/* Enhanced Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden w-11 h-11 p-0 rounded-xl bg-white/20 hover:bg-white/30 hover:scale-105 transition-all duration-200 border border-white/30 text-gray-900 dark:text-white shadow-lg animate-scale-in"
                style={{ animationDelay: '400ms' }}
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Enhanced Mobile Navigation - Improved with Better Animations */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full right-0 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-l border-gray-200/50 dark:border-gray-800/50 shadow-2xl z-[9999] transform-gpu will-change-transform rounded-bl-2xl animate-slide-in-right">
              <div className="px-4 py-3 space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { navigate('/'); toggleMenu(); }}>
                  <HomeIcon className="h-4 w-4 mr-2" />
                  {currentText.home}
                </Button>

                {/* Mobile Property Navigation */}
                {propertyNavItems.map((item) => (
                  <Button 
                    key={item.path}
                    variant="ghost" 
                    className={`w-full justify-start text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${item.color}`} 
                    onClick={() => { navigate(item.path); toggleMenu(); }}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}

                <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { navigate('/services'); toggleMenu(); }}>
                  <Settings2 className="h-4 w-4 mr-2" />
                  {currentText.services}
                </Button>

                {/* Properties Navigation */}
                <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { navigate('/buy'); toggleMenu(); }}>
                  <Building className="h-4 w-4 mr-2" />
                  Properties
                </Button>
                
                <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { navigate('/add-property'); toggleMenu(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>

                {/* Investment Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Investment
                  </div>
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 pl-6" onClick={() => { navigate('/foreign-investment'); toggleMenu(); }}>
                    <Building className="h-4 w-4 mr-2" />
                    Foreign Investment
                  </Button>
                </div>

                
                {/* Dashboard link - show for authenticated users */}
                {user && !isAdmin && !isAgent && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { navigate('/dashboard/user'); toggleMenu(); }}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {currentText.dashboard}
                  </Button>
                )}

                {/* Agent Dashboard for mobile */}
                {isAgent && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => { navigate('/agent'); toggleMenu(); }}>
                    <User className="h-4 w-4 mr-2" />
                    Agent Dashboard
                  </Button>
                )}

                {/* Vendor Dashboard for mobile */}
                {profile?.role === 'vendor' && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20" onClick={() => { navigate('/vendor'); toggleMenu(); }}>
                    <Settings className="h-4 w-4 mr-2" />
                    Vendor Dashboard
                  </Button>
                )}
                
                {/* Admin Panel - only show for admin users */}
                {isAdmin && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => { navigate('/admin-dashboard'); toggleMenu(); }}>
                    {currentText.adminPanel}
                  </Button>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {theme === "light" ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                    {theme === "light" ? "Dark" : "Light"}
                  </Button>
                  <LanguageToggleSwitch />
                </div>
                {user && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleSignOut}>
                    {currentText.signOut}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>


      {/* Enhanced Auth Modal */}
      <EnhancedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        language={language}
      />
    </>
  );
};

export default Navigation;
