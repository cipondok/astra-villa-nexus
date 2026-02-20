import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, Settings, LogOut, Crown, Moon, Sun, Sparkles, Brain, Home as HomeIcon, Building, Key, Rocket, Hammer, BarChart3, Headphones, Box, Settings2, Bell, Coins, ChevronDown, TrendingUp, Plus, List, MapPin, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import LanguageToggleSwitch from "./LanguageToggleSwitch";
import EnhancedAuthModal from "./auth/EnhancedAuthModal";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";
import UserIconWithBadge from "./ui/UserIconWithBadge";
import { useHeaderLogo } from "@/hooks/useBrandingLogo";
import CrystalLogo3D from "./effects/CrystalLogo3D";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch header logo from system settings (checks both categories)
  const { logoUrl: headerLogoUrl, isLoading: isLogoLoading, hasCustomLogo } = useHeaderLogo();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close mobile menu on scroll
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleScroll = () => setIsMenuOpen(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  // Close mobile menu when clicking anywhere outside the menu and toggle button
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (menuButtonRef.current?.contains(target)) return;
      setIsMenuOpen(false);
    };
    // Use capture phase to catch clicks before they're stopped
    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('touchend', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('touchend', handleGlobalClick, true);
    };
  }, [isMenuOpen]);

  // Handle scroll effect - transparent at top, solid when scrolled
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 10;
          setScrolled(isScrolled);
          // Check if hero section is scrolled past
          const heroSection = document.getElementById('hero-section');
          if (heroSection) {
            const heroBottom = heroSection.getBoundingClientRect().bottom;
            setPastHero(heroBottom < 60);
          } else {
            setPastHero(window.scrollY > 600);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
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
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-400/20 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/20'
    },
    { 
      icon: Key, 
      label: currentText.rentProperties, 
      path: '/disewa',
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/30 dark:border-blue-400/20 hover:bg-blue-500/20 hover:border-blue-500/50 hover:shadow-blue-500/20'
    },
    { 
      icon: Rocket, 
      label: currentText.preLaunch, 
      path: '/pre-launching',
      color: 'text-violet-700 dark:text-violet-400',
      bg: 'bg-violet-500/10 dark:bg-violet-500/10 border-violet-500/30 dark:border-violet-400/20 hover:bg-violet-500/20 hover:border-violet-500/50 hover:shadow-violet-500/20'
    },
    { 
      icon: Hammer, 
      label: currentText.newProjects, 
      path: '/new-projects',
      color: 'text-orange-700 dark:text-orange-400',
      bg: 'bg-orange-500/10 dark:bg-orange-500/10 border-orange-500/30 dark:border-orange-400/20 hover:bg-orange-500/20 hover:border-orange-500/50 hover:shadow-orange-500/20'
    },
    { 
      icon: Box, 
      label: 'VR Tours', 
      path: '/vr-tour',
      color: 'text-indigo-700 dark:text-indigo-400',
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/10 border-indigo-500/30 dark:border-indigo-400/20 hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:shadow-indigo-500/20'
    }
  ];

  const isAgent = profile?.role === 'agent';
  const isHomePage = location.pathname === '/';
  
  // Note: admin check is handled by isAdmin hook

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(headerSearchQuery.trim())}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 w-full z-[10000] transition-all duration-500",
          isHomePage && !scrolled
            ? "bg-transparent border-b border-white/10 shadow-none"
            : "header-ios glass-popup backdrop-blur-2xl border-b border-primary/15 dark:border-primary/10 shadow-sm shadow-primary/5",
          pastHero ? "h-12 md:h-13 lg:h-14" : "h-10 md:h-11 lg:h-12"
        )} 
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="w-full mx-auto px-1 sm:px-2 lg:px-4">
          <div className={cn("flex items-center justify-between gap-2 transition-all duration-300", pastHero ? "h-12 md:h-13 lg:h-14" : "h-10 md:h-11 lg:h-12")}>
            {/* Enhanced ASTRA Villa Logo with Animation - Left Corner */}
            <div 
              className="flex items-center cursor-pointer group flex-shrink-0 -ml-1" 
              onClick={() => navigate('/')}
            >
              {hasCustomLogo ? (
                <div className="relative group/logo overflow-visible">
                  {/* Crystal Glass Logo Effect */}
                  <CrystalLogo3D 
                    logoUrl={headerLogoUrl} 
                    size="lg"
                  />
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/80 via-accent/70 to-primary/60 backdrop-blur-sm border border-primary/40 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-2xl group-hover:shadow-primary/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <img 
                      src={headerLogoUrl} 
                      alt="ASTRA Villa" 
                      className="h-7 w-7 md:h-8 md:w-8 object-contain"
                    />
                  </div>
                  <div className="hidden sm:flex items-center space-x-1">
                    <span className={cn("text-lg font-bold drop-shadow-lg group-hover:scale-110 transition-all duration-500 group-hover:drop-shadow-2xl", isHomePage && !scrolled ? "text-white" : "bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent")}>ASTRA</span>
                    <span className={cn("text-lg font-bold drop-shadow-lg group-hover:scale-110 transition-all duration-500 group-hover:drop-shadow-2xl", isHomePage && !scrolled ? "text-white/90" : "bg-gradient-to-r from-accent via-primary to-foreground bg-clip-text text-transparent")}>Villa</span>
                  </div>
                </>
              )}
            </div>

            {/* Enhanced Desktop Navigation - Main Menu */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-5xl">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-9 px-3 text-sm font-medium text-foreground/80 rounded-xl backdrop-blur-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 hover:scale-110 hover:shadow-lg hover:shadow-primary/30 transition-all duration-500"
                onClick={() => navigate('/')}
              >
                <HomeIcon className="h-4 w-4 xl:mr-1.5 text-primary transition-all duration-500" />
                <span className="hidden xl:inline text-xs">{currentText.home}</span>
              </Button>

              {/* Enhanced Property Navigation Items - Icon Only */}
              {propertyNavItems.map((item, index) => (
                <div key={item.path} className="relative group">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`w-9 h-9 p-0 rounded-xl backdrop-blur-xl border hover:scale-110 hover:shadow-lg transition-all duration-500 ${item.bg}`}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className={`h-4 w-4 transition-all duration-500 ${item.color}`} />
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
                  className="w-9 h-9 p-0 rounded-xl backdrop-blur-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/20 dark:bg-cyan-500/10 dark:border-cyan-400/20 transition-all duration-500"
                  onClick={() => navigate('/services')}
                >
                  <Settings2 className="h-4 w-4 text-cyan-700 dark:text-cyan-400 transition-all duration-500" />
                </Button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 glass-popup text-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap pointer-events-none z-[10001] shadow-2xl shadow-primary/30 border border-primary/30">
                  {currentText.services}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary/20 rotate-45 -mb-1"></div>
                </div>
              </div>

              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate('/add-property')}
                className="h-9 px-3 text-sm font-medium rounded-xl backdrop-blur-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50 hover:scale-110 hover:shadow-lg hover:shadow-rose-500/20 dark:bg-rose-500/10 dark:border-rose-400/20 transition-all duration-500"
              >
                <Plus className="h-4 w-4 xl:mr-1.5 text-rose-700 dark:text-rose-400 transition-all duration-500" />
                <span className="hidden xl:inline text-xs text-foreground/80">Add Property</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-9 px-3 text-sm font-medium rounded-xl backdrop-blur-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 hover:scale-110 hover:shadow-lg hover:shadow-amber-500/20 dark:bg-amber-500/10 dark:border-amber-400/20 transition-all duration-500"
                  >
                    <TrendingUp className="h-4 w-4 xl:mr-1.5 text-amber-700 dark:text-amber-400 transition-all duration-500" />
                    <span className="hidden xl:inline text-xs text-foreground/80">Investment</span>
                    <ChevronDown className="h-3 w-3 ml-1 hidden xl:inline text-foreground/60 transition-transform duration-500" />
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
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Search bar - appears on ALL devices when scrolled past hero */}
              {pastHero && isHomePage && (
                <form onSubmit={handleHeaderSearch} className="flex items-center gap-1">
                  <div className="relative">
                    <Input
                      type="text"
                      value={headerSearchQuery}
                      onChange={(e) => setHeaderSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="px-3 h-7 sm:h-8 w-24 sm:w-32 lg:w-44 xl:w-56 text-[11px] sm:text-xs bg-muted/30 dark:bg-muted/20 border-border/40 rounded-lg focus:bg-background focus:w-36 sm:focus:w-44 lg:focus:w-56 transition-all duration-300"
                    />
                  </div>
                  <Button type="submit" size="sm" className="h-7 sm:h-8 w-7 sm:w-8 p-0 rounded-lg bg-primary hover:bg-primary/90 shrink-0">
                    <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </form>
              )}

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

              {/* Enhanced Language Toggle - Hidden on mobile/tablet */}
              <div className="hidden xl:block">
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

              {/* Mobile/Tablet menu button - visible on screens smaller than lg (1024px) */}
              <div className="lg:hidden flex items-center">
                <Button
                  ref={menuButtonRef}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-xl bg-primary/5 hover:bg-primary/10 hover:scale-110 hover:shadow-lg hover:shadow-primary/30 transition-all duration-500 border border-primary/20 hover:border-primary/40 text-foreground hover:text-primary"
                  onClick={toggleMenu}
                >
                  {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Mobile Navigation - Slim & Compact with Smooth Open Effect */}
          {isMenuOpen && (
            <>
              {/* Overlay backdrop - click to close - covers full screen */}
              <div 
                className="lg:hidden fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-[9998] animate-in fade-in duration-200"
                onClick={() => setIsMenuOpen(false)}
                onTouchEnd={(e) => { e.preventDefault(); setIsMenuOpen(false); }}
              />
              
              {/* Menu content with smooth slide and scale animation */}
              <div ref={menuRef} className="lg:hidden absolute top-full right-0 w-48 glass-popup backdrop-blur-2xl border-primary/20 shadow-2xl shadow-primary/30 z-[9999] rounded-bl-2xl rounded-tl-lg overflow-hidden animate-in slide-in-from-top-2 fade-in zoom-in-95 duration-500 origin-top-right">
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
