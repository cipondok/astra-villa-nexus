
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, Settings, LogOut, Crown, Moon, Sun, Sparkles, Brain, Home as HomeIcon, Building, Key, Rocket, Hammer, BarChart3, Headphones, Box, Settings2, Bell, Coins, ChevronDown, TrendingUp, Plus, List, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import LanguageToggleSwitch from "./LanguageToggleSwitch";
import EnhancedAuthModal from "./auth/EnhancedAuthModal";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";
import UserIconWithBadge from "./ui/UserIconWithBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Fetch header logo from system settings
  const { data: headerLogoUrl } = useQuery({
    queryKey: ['header-logo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'headerLogo')
        .maybeSingle();
      
      if (error || !data) return null;
      return typeof data.value === 'string' ? data.value : null;
    },
  });

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
      <nav className="fixed top-0 left-0 right-0 w-full z-[10000] header-ios bg-background/30 backdrop-blur-2xl border-b border-primary/10 shadow-2xl shadow-primary/5 h-10 md:h-11 lg:h-12 transition-all duration-700">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-10 md:h-11 lg:h-12 gap-2">
            {/* Enhanced ASTRA Villa Logo with Animation */}
            <div 
              className="flex items-center space-x-2 cursor-pointer group flex-shrink-0" 
              onClick={() => navigate('/')}
            >
              {headerLogoUrl ? (
                <div className="relative group/logo overflow-hidden rounded-sm mt-3">
                  {/* Logo - overflows header downward */}
                  <img 
                    src={headerLogoUrl} 
                    alt="ASTRA Villa" 
                    className="relative h-14 md:h-16 lg:h-20 w-auto object-contain transition-all duration-300 group-hover/logo:scale-105"
                  />
                  
                  {/* Continuous Shine Reflection Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-1/4 animate-shimmer pointer-events-none" />
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/80 via-accent/70 to-primary/60 backdrop-blur-sm border border-primary/40 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-2xl group-hover:shadow-primary/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Brain className="h-5 w-5 md:h-6 md:w-6 text-background animate-pulse group-hover:text-primary-foreground transition-colors duration-500" />
                  </div>
                  <div className="hidden sm:flex items-center space-x-1">
                    <span className="text-lg font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent drop-shadow-lg group-hover:scale-110 transition-all duration-500 group-hover:drop-shadow-2xl">ASTRA</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-accent via-primary to-foreground bg-clip-text text-transparent drop-shadow-lg group-hover:scale-110 transition-all duration-500 group-hover:drop-shadow-2xl">Villa</span>
                  </div>
                </>
              )}
            </div>

            {/* Enhanced Desktop Navigation - Main Menu */}
            <div className="hidden xl:flex items-center gap-1 flex-1 justify-center max-w-5xl">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-10 px-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 rounded-xl transition-all duration-500 border border-transparent hover:border-primary/20"
                onClick={() => navigate('/')}
              >
                <HomeIcon className="h-3.5 w-3.5 xl:mr-1.5 transition-all duration-500" />
                <span className="hidden xl:inline text-xs">{currentText.home}</span>
              </Button>

              {/* Enhanced Property Navigation Items - Icon Only */}
              {propertyNavItems.map((item, index) => (
                <div key={item.path} className="relative group">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-10 w-10 p-0 hover:bg-primary/10 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 rounded-xl transition-all duration-500 text-foreground/80 hover:text-primary border border-transparent hover:border-primary/20"
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-3.5 w-3.5 transition-all duration-500" />
                  </Button>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 glass-popup text-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap pointer-events-none z-[10001] shadow-2xl shadow-primary/30 border border-primary/30">
                    {item.label}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary/20 rotate-45 -mb-1"></div>
                  </div>
                </div>
              ))}

              <div className="relative group">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 w-10 p-0 hover:bg-primary/10 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 rounded-xl transition-all duration-500 text-foreground/80 hover:text-primary border border-transparent hover:border-primary/20"
                  onClick={() => navigate('/services')}
                >
                  <Settings2 className="h-4 w-4 transition-all duration-500" />
                </Button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 glass-popup text-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap pointer-events-none z-[10001] shadow-2xl shadow-primary/30 border border-primary/30">
                  {currentText.services}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary/20 rotate-45 -mb-1"></div>
                </div>
              </div>

              {/* Add Property Button */}
              <Button 
                size="sm"
                onClick={() => navigate('/add-property')}
                className="h-10 px-4 text-xs font-medium bg-gradient-to-r from-primary via-accent to-primary hover:from-accent hover:via-primary hover:to-accent text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 hover:scale-110 rounded-xl transition-all duration-500 border border-primary/20 backdrop-blur-sm animate-gradient"
              >
                <Plus className="h-4 w-4 mr-1.5 transition-transform duration-500 group-hover:rotate-90" />
                Add Property
              </Button>

              {/* Investment Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-10 px-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 rounded-xl transition-all duration-500 border border-transparent hover:border-primary/20"
                  >
                    <TrendingUp className="h-4 w-4 xl:mr-1.5 transition-all duration-500" />
                    <span className="hidden xl:inline text-xs">Investment</span>
                    <ChevronDown className="h-3 w-3 ml-1 hidden xl:inline transition-transform duration-500 group-hover:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-popup backdrop-blur-2xl border-primary/20 shadow-2xl shadow-primary/30 z-[10001]">
                  <DropdownMenuItem 
                    onClick={() => navigate('/foreign-investment')}
                    className="cursor-pointer text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all duration-500 rounded-lg"
                  >
                    <Building className="h-4 w-4 mr-2 transition-all duration-500" />
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

            </div>

            {/* Enhanced Right Section - Compact Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Enhanced Dark Mode Toggle - Binance Style */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-9 h-9 p-0 rounded-xl backdrop-blur-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 hover:scale-110 hover:shadow-lg hover:shadow-primary/30 transition-all duration-500 hover:rotate-12"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4 text-primary transition-all duration-500" />
                ) : (
                  <Sun className="h-4 w-4 text-primary transition-all duration-500" />
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
                    className="w-9 h-9 p-0 rounded-xl bg-primary/5 hover:bg-primary/10 hover:scale-110 hover:shadow-lg hover:shadow-primary/30 transition-all duration-500 border border-primary/20 hover:border-primary/40 text-foreground hover:text-primary"
                  >
                    <User className="h-4 w-4 transition-all duration-500" />
                  </Button>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 glass-popup text-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap pointer-events-none z-[10001] shadow-2xl shadow-primary/30 border border-primary/30">
                    {currentText.signIn}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary/20 rotate-45 -mb-1"></div>
                  </div>
                </div>
              )}

              {/* Enhanced Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden w-8 h-8 p-0 rounded-xl bg-primary/5 hover:bg-primary/10 hover:scale-110 hover:shadow-lg hover:shadow-primary/30 transition-all duration-500 border border-primary/20 hover:border-primary/40 text-foreground hover:text-primary animate-scale-in"
                style={{ animationDelay: '400ms' }}
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-4 w-4 transition-all duration-500" /> : <Menu className="h-4 w-4 transition-all duration-500" />}
              </Button>
            </div>
          </div>

          {/* Enhanced Mobile Navigation - Slim & Compact with Smooth Open Effect */}
          {isMenuOpen && (
            <>
              {/* Overlay backdrop - click to close - positioned relative to nav */}
              <div 
                className="lg:hidden fixed inset-0 top-[2.5rem] md:top-[2.75rem] bg-black/30 dark:bg-black/50 backdrop-blur-sm z-[9998] animate-in fade-in duration-200"
                onClick={toggleMenu}
                style={{ marginTop: '0' }}
              />
              
              {/* Menu content with smooth slide and scale animation */}
              <div className="lg:hidden absolute top-full right-0 w-44 glass-popup backdrop-blur-2xl border-primary/20 shadow-2xl shadow-primary/30 z-[9999] rounded-bl-2xl rounded-tl-lg overflow-hidden animate-in slide-in-from-top-2 fade-in zoom-in-95 duration-500 origin-top-right">
                <div className="px-1.5 py-1.5 space-y-0.5">
                <Button variant="ghost" className="w-full justify-start h-8 text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => { navigate('/'); toggleMenu(); }}>
                  <HomeIcon className="h-3 w-3 mr-1.5" />
                  {currentText.home}
                </Button>

                {/* Mobile Property Navigation */}
                {propertyNavItems.map((item) => (
                  <Button 
                    key={item.path}
                    variant="ghost" 
                    className={`w-full justify-start h-8 text-[11px] font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg ${item.color}`} 
                    onClick={() => { navigate(item.path); toggleMenu(); }}
                  >
                    <item.icon className="h-3 w-3 mr-1.5" />
                    {item.label}
                  </Button>
                ))}

                <Button variant="ghost" className="w-full justify-start h-8 text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => { navigate('/location'); toggleMenu(); }}>
                  <MapPin className="h-3 w-3 mr-1.5" />
                  {language === 'en' ? 'Location Map' : 'Peta Lokasi'}
                </Button>

                <Button variant="ghost" className="w-full justify-start h-8 text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => { navigate('/services'); toggleMenu(); }}>
                  <Settings2 className="h-3 w-3 mr-1.5" />
                  {currentText.services}
                </Button>

                {/* Properties Navigation */}
                <Button variant="ghost" className="w-full justify-start h-8 text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => { navigate('/buy'); toggleMenu(); }}>
                  <Building className="h-3 w-3 mr-1.5" />
                  Properties
                </Button>
                
                <Button variant="ghost" className="w-full justify-start h-8 text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => { navigate('/add-property'); toggleMenu(); }}>
                  <Plus className="h-3 w-3 mr-1.5" />
                  Add Property
                </Button>

                {/* Investment Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                  <div className="px-1.5 py-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Investment
                  </div>
                  <Button variant="ghost" className="w-full justify-start h-8 text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg pl-4" onClick={() => { navigate('/foreign-investment'); toggleMenu(); }}>
                    <Building className="h-3 w-3 mr-1.5" />
                    Foreign Investment
                  </Button>
                </div>

                
                {/* Dashboard link - show for authenticated users */}
                {user && !isAdmin && !isAgent && (
                  <Button variant="ghost" className="w-full justify-start h-8 text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => { navigate('/dashboard/user'); toggleMenu(); }}>
                    <BarChart3 className="h-3 w-3 mr-1.5" />
                    {currentText.dashboard}
                  </Button>
                )}

                {/* Agent Dashboard for mobile */}
                {isAgent && (
                  <Button variant="ghost" className="w-full justify-start h-8 text-[11px] font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" onClick={() => { navigate('/agent'); toggleMenu(); }}>
                    <User className="h-3 w-3 mr-1.5" />
                    Agent Dashboard
                  </Button>
                )}

                {/* Vendor Dashboard for mobile */}
                {profile?.role === 'vendor' && (
                  <Button variant="ghost" className="w-full justify-start h-8 text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg" onClick={() => { navigate('/vendor'); toggleMenu(); }}>
                    <Settings className="h-3 w-3 mr-1.5" />
                    Vendor Dashboard
                  </Button>
                )}
                
                
                <div className="flex items-center justify-between pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="h-7 text-[11px] text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    {theme === "light" ? <Moon className="h-3 w-3 mr-1" /> : <Sun className="h-3 w-3 mr-1" />}
                    {theme === "light" ? "Dark" : "Light"}
                  </Button>
                  <LanguageToggleSwitch />
                </div>
                {user && (
                  <Button variant="ghost" className="w-full justify-start h-8 text-[11px] font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" onClick={handleSignOut}>
                    {currentText.signOut}
                  </Button>
                )}
              </div>
              </div>
            </>
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
