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
          "fixed top-0 left-0 right-0 w-full z-[10000] transition-all duration-500 ease-out",
          isHomePage && !scrolled
            ? "bg-transparent border-b border-white/10 shadow-none"
            : "bg-background/80 backdrop-blur-2xl border-b border-border/40 shadow-sm",
          pastHero ? "h-12 md:h-13 lg:h-14" : "h-10 md:h-11 lg:h-12"
        )} 
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="w-full mx-auto px-1.5 sm:px-3 lg:px-4">
          <div className={cn("flex items-center justify-between gap-2 transition-all duration-300", pastHero ? "h-12 md:h-13 lg:h-14" : "h-10 md:h-11 lg:h-12")}>
            {/* Logo - Left */}
            <div 
              className="flex items-center cursor-pointer group flex-shrink-0 -ml-1" 
              onClick={() => navigate('/')}
            >
              {hasCustomLogo ? (
                <div className="relative group/logo overflow-visible">
                  <CrystalLogo3D 
                    logoUrl={headerLogoUrl} 
                    size="lg"
                  />
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/80 via-accent/70 to-primary/60 backdrop-blur-sm border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/15 group-hover:shadow-xl group-hover:shadow-primary/25 transition-all duration-500 group-hover:scale-105">
                    <img 
                      src={headerLogoUrl} 
                      alt="ASTRA Villa" 
                      className="h-7 w-7 md:h-8 md:w-8 object-contain"
                    />
                  </div>
                  <div className="hidden sm:flex items-center space-x-1 ml-1">
                    <span className={cn("text-lg font-bold transition-all duration-500", isHomePage && !scrolled ? "text-white drop-shadow-lg" : "text-foreground")}>ASTRA</span>
                    <span className={cn("text-lg font-bold transition-all duration-500", isHomePage && !scrolled ? "text-white/90 drop-shadow-lg" : "text-muted-foreground")}>Villa</span>
                  </div>
                </>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-5xl">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-3 text-xs font-medium rounded-xl bg-muted/40 border border-border/50 hover:bg-primary/10 hover:border-primary/30 hover:scale-105 transition-all duration-300 text-foreground/80"
                onClick={() => navigate('/')}
              >
                <HomeIcon className="h-4 w-4 xl:mr-1.5 text-primary" />
                <span className="hidden xl:inline">{currentText.home}</span>
              </Button>

              {/* Property Navigation Items */}
              {propertyNavItems.map((item) => (
                <div key={item.path} className="relative group">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`w-8 h-8 p-0 rounded-xl border hover:scale-105 hover:shadow-md transition-all duration-300 ${item.bg}`}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </Button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-foreground text-background text-[10px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-[10001] shadow-lg">
                    {item.label}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45 -mb-1" />
                  </div>
                </div>
              ))}

              <div className="relative group">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-8 h-8 p-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:scale-105 hover:shadow-md transition-all duration-300"
                  onClick={() => navigate('/services')}
                >
                  <Settings2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </Button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-foreground text-background text-[10px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-[10001] shadow-lg">
                  {currentText.services}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45 -mb-1" />
                </div>
              </div>

              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate('/add-property')}
                className="h-8 px-3 text-xs font-medium rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 hover:scale-105 hover:shadow-md transition-all duration-300"
              >
                <Plus className="h-4 w-4 xl:mr-1.5 text-rose-600 dark:text-rose-400" />
                <span className="hidden xl:inline text-foreground/80">Add Property</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 px-3 text-xs font-medium rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 hover:scale-105 hover:shadow-md transition-all duration-300"
                  >
                    <TrendingUp className="h-4 w-4 xl:mr-1.5 text-amber-600 dark:text-amber-400" />
                    <span className="hidden xl:inline text-foreground/80">Investment</span>
                    <ChevronDown className="h-3 w-3 ml-1 hidden xl:inline text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-popover/95 backdrop-blur-xl border-border/50 shadow-xl z-[10001]">
                  <DropdownMenuItem 
                    onClick={() => navigate('/foreign-investment')}
                    className="cursor-pointer text-foreground/80 hover:text-primary rounded-lg"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Foreign Investment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

               {/* Dashboard link */}
               {user && !isAdmin && !isAgent && (
                 <Button 
                   variant="ghost" 
                   size="sm"
                   className="h-8 px-2.5 text-xs font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-300"
                   onClick={() => navigate('/dashboard/user')}
                 >
                   <BarChart3 className="h-4 w-4 xl:mr-1" />
                   <span className="hidden xl:inline">Dashboard</span>
                 </Button>
               )}

              {/* Agent Dashboard */}
              {isAgent && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 px-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all duration-300"
                  onClick={() => navigate('/agent')}
                >
                  <User className="h-4 w-4 xl:mr-1" />
                  <span className="hidden xl:inline">Agent</span>
                </Button>
              )}

              {/* Vendor Dashboard */}
              {profile?.role === 'vendor' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 px-2.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 rounded-xl transition-all duration-300"
                  onClick={() => navigate('/vendor')}
                >
                  <Settings className="h-4 w-4 xl:mr-1" />
                  <span className="hidden xl:inline">Vendor</span>
                </Button>
              )}

            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Search bar - appears when scrolled past hero */}
              {pastHero && isHomePage && (
                <form onSubmit={handleHeaderSearch} className="flex items-center gap-1">
                  <div className="relative">
                    <Input
                      type="text"
                      value={headerSearchQuery}
                      onChange={(e) => setHeaderSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="px-3 h-7 sm:h-8 w-24 sm:w-32 lg:w-44 xl:w-56 text-[11px] sm:text-xs bg-muted/30 border-border/40 rounded-lg focus:bg-background focus:w-36 sm:focus:w-44 lg:focus:w-56 transition-all duration-300"
                    />
                  </div>
                  <Button type="submit" size="sm" className="h-7 sm:h-8 w-7 sm:w-8 p-0 rounded-lg bg-primary hover:bg-primary/90 shrink-0">
                    <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </form>
              )}

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-8 h-8 p-0 rounded-xl bg-muted/40 border border-border/50 hover:bg-primary/10 hover:border-primary/30 hover:scale-105 transition-all duration-300"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4 text-foreground/70" />
                ) : (
                  <Sun className="h-4 w-4 text-primary" />
                )}
              </Button>

              {/* Language Toggle */}
              <div className="hidden xl:block">
                <LanguageToggleSwitch />
              </div>

              {/* Notifications */}
              {user && <NotificationDropdown />}

              {/* User */}
              {user ? (
                <UserIconWithBadge onNavigate={(path) => navigate(path)} />
              ) : (
                <div className="relative group">
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 rounded-xl bg-muted/40 border border-border/50 hover:bg-primary/10 hover:border-primary/30 hover:scale-105 transition-all duration-300 text-foreground/70 hover:text-primary"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-foreground text-background text-[10px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-[10001] shadow-lg">
                    {currentText.signIn}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45 -mb-1" />
                  </div>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="lg:hidden flex items-center">
                <Button
                  ref={menuButtonRef}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-xl bg-muted/40 border border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 text-foreground/70"
                  onClick={toggleMenu}
                >
                  {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <>
              <div 
                className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] animate-in fade-in duration-200"
                onClick={() => setIsMenuOpen(false)}
                onTouchEnd={(e) => { e.preventDefault(); setIsMenuOpen(false); }}
              />
              
              <div ref={menuRef} className="lg:hidden absolute top-full right-0 w-52 bg-popover/95 backdrop-blur-2xl border border-border/50 shadow-2xl z-[9999] rounded-b-2xl rounded-tl-lg overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300 origin-top-right">
                <div className="p-2 space-y-0.5">
                  <MobileNavButton icon={HomeIcon} label={currentText.home} onClick={() => { navigate('/'); toggleMenu(); }} />

                  {/* Property Navigation */}
                  {propertyNavItems.map((item) => (
                    <MobileNavButton 
                      key={item.path}
                      icon={item.icon} 
                      label={item.label} 
                      colorClass={item.color}
                      onClick={() => { navigate(item.path); toggleMenu(); }}
                    />
                  ))}

                  <MobileNavButton icon={MapPin} label={language === 'en' ? 'Location Map' : 'Peta Lokasi'} onClick={() => { navigate('/location'); toggleMenu(); }} />
                  <MobileNavButton icon={Settings2} label={currentText.services} onClick={() => { navigate('/services'); toggleMenu(); }} />
                  <MobileNavButton icon={Building} label="Properties" onClick={() => { navigate('/buy'); toggleMenu(); }} />
                  <MobileNavButton icon={Plus} label="Add Property" onClick={() => { navigate('/add-property'); toggleMenu(); }} />

                  {/* Investment Section */}
                  <div className="border-t border-border/50 pt-1.5 mt-1.5">
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Investment
                    </div>
                    <MobileNavButton icon={Building} label="Foreign Investment" onClick={() => { navigate('/foreign-investment'); toggleMenu(); }} indent />
                  </div>

                  {/* Dashboard links */}
                  {user && !isAdmin && !isAgent && (
                    <MobileNavButton icon={BarChart3} label={currentText.dashboard} onClick={() => { navigate('/dashboard/user'); toggleMenu(); }} />
                  )}
                  {isAgent && (
                    <MobileNavButton icon={User} label="Agent Dashboard" colorClass="text-emerald-600 dark:text-emerald-400" onClick={() => { navigate('/agent'); toggleMenu(); }} />
                  )}
                  {profile?.role === 'vendor' && (
                    <MobileNavButton icon={Settings} label="Vendor Dashboard" colorClass="text-violet-600 dark:text-violet-400" onClick={() => { navigate('/vendor'); toggleMenu(); }} />
                  )}
                  
                  <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleTheme}
                      className="h-7 text-[11px] text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-lg"
                    >
                      {theme === "light" ? <Moon className="h-3 w-3 mr-1" /> : <Sun className="h-3 w-3 mr-1" />}
                      {theme === "light" ? "Dark" : "Light"}
                    </Button>
                    <LanguageToggleSwitch />
                  </div>
                  {user && (
                    <Button variant="ghost" className="w-full justify-start h-8 text-[11px] font-medium text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={handleSignOut}>
                      <LogOut className="h-3 w-3 mr-1.5" />
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

// Reusable mobile nav button
const MobileNavButton: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  colorClass?: string;
  indent?: boolean;
}> = ({ icon: Icon, label, onClick, colorClass, indent }) => (
  <Button
    variant="ghost"
    className={cn(
      "w-full justify-start h-8 text-[11px] font-medium rounded-lg hover:bg-muted/50",
      colorClass || "text-foreground/70 hover:text-foreground",
      indent && "pl-4"
    )}
    onClick={onClick}
  >
    <Icon className="h-3 w-3 mr-1.5 flex-shrink-0" />
    {label}
  </Button>
);

export default Navigation;
