import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, Settings, LogOut, Moon, Sun, Home as HomeIcon, Building, Key, Rocket, Hammer, BarChart3, Box, Settings2, Bell, TrendingUp, Plus, MapPin, Search, Calculator, Heart, MessageSquare, Layers, Users, BookOpen, Shield, ChevronDown, Compass, Scale } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme } from "@/components/ThemeProvider";
import LanguageToggleSwitch from "./LanguageToggleSwitch";
import CurrencySelector from "./CurrencySelector";
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
  const { language, t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const { logoUrl: headerLogoUrl, isLoading: isLogoLoading, hasCustomLogo } = useHeaderLogo();

  useEffect(() => { setIsMenuOpen(false); }, [location]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleScroll = () => setIsMenuOpen(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleResize = () => { if (window.innerWidth >= 1024) setIsMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || menuButtonRef.current?.contains(target)) return;
      setIsMenuOpen(false);
    };
    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('touchend', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('touchend', handleGlobalClick, true);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          const heroSection = document.getElementById('hero-section');
          setPastHero(heroSection ? heroSection.getBoundingClientRect().bottom < 60 : window.scrollY > 600);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const navIconStyle = 'bg-muted/50 border-border/50 hover:bg-gold-primary/10 hover:border-gold-primary/30 hover:scale-105 hover:shadow-md transition-all duration-300';
  const navIconColor = 'text-foreground/70';

  const propertyNavItems = [
    { icon: Building, label: t('nav2.buyProperties'), path: '/dijual' },
    { icon: Key, label: t('nav2.rentProperties'), path: '/disewa' },
    { icon: Rocket, label: t('nav2.preLaunch'), path: '/pre-launching' },
    { icon: Hammer, label: t('nav2.newProjects'), path: '/new-projects' },
  ];

  const isAgent = profile?.role === 'agent';
  const isHomePage = location.pathname === '/';

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(headerSearchQuery.trim())}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 w-full z-[10000] transition-all duration-500 ease-out",
          isHomePage && !scrolled
            ? "bg-transparent border-b border-white/10 shadow-none"
            : "bg-background/80 backdrop-blur-2xl border-b border-gold-primary/10 shadow-sm",
          pastHero ? "h-12 md:h-13 lg:h-14" : "h-10 md:h-11 lg:h-12"
        )} 
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="w-full mx-auto px-1.5 sm:px-3 lg:px-4">
          <div className={cn("flex items-center justify-between gap-2 transition-all duration-300", pastHero ? "h-12 md:h-13 lg:h-14" : "h-10 md:h-11 lg:h-12")}>
            {/* Logo */}
            <div className="flex items-center cursor-pointer group flex-shrink-0 -ml-1" onClick={() => navigate('/')}>
              {hasCustomLogo ? (
                <div className="relative group/logo overflow-visible">
                  <CrystalLogo3D logoUrl={headerLogoUrl} size="lg" />
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/80 via-accent/70 to-primary/60 backdrop-blur-sm border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/15 group-hover:shadow-xl group-hover:shadow-primary/25 transition-all duration-500 group-hover:scale-105">
                    <img src={headerLogoUrl} alt="ASTRA Villa" className="h-7 w-7 md:h-8 md:w-8 object-contain" />
                  </div>
                  <div className="hidden sm:flex items-center space-x-1 ml-1">
                    <span className={cn("text-lg font-bold transition-all duration-500", isHomePage && !scrolled ? "text-primary-foreground drop-shadow-lg" : "text-foreground")}>ASTRA</span>
                    <span className={cn("text-lg font-bold transition-all duration-500", isHomePage && !scrolled ? "text-primary-foreground/90 drop-shadow-lg" : "text-muted-foreground")}>Villa</span>
                  </div>
                </>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-5xl">
              {/* Home */}
              <NavIconButton icon={HomeIcon} label={t('nav.home')} isActive={isActive('/')} onClick={() => navigate('/')} showLabel />

              {/* Properties Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className={`h-8 px-3 text-xs font-medium rounded-xl border ${navIconStyle} gap-1`}>
                    <Building className={`h-4 w-4 ${navIconColor}`} />
                    <span className="hidden xl:inline text-foreground/80">{t('nav.properties')}</span>
                    <ChevronDown className="h-3 w-3 text-foreground/50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 bg-popover/95 backdrop-blur-2xl border-gold-primary/15 shadow-2xl z-[10001]">
                  <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('nav.properties')}</DropdownMenuLabel>
                  {propertyNavItems.map((item) => (
                    <DropdownMenuItem key={item.path} className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate(item.path)}>
                      <item.icon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/vr-tour')}>
                    <Box className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    VR Tours
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/property-comparison')}>
                    <Scale className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Compare Properties
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/location')}>
                    <MapPin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    {t('nav2.location')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className={`h-8 px-3 text-xs font-medium rounded-xl border ${navIconStyle} gap-1`}>
                    <Compass className={`h-4 w-4 ${navIconColor}`} />
                    <span className="hidden xl:inline text-foreground/80">Tools</span>
                    <ChevronDown className="h-3 w-3 text-foreground/50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 bg-popover/95 backdrop-blur-2xl border-gold-primary/15 shadow-2xl z-[10001]">
                  <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">Calculators</DropdownMenuLabel>
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/ai-pricing')}>
                    <Calculator className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    AI Price Estimator
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/calculators/loan')}>
                    <BarChart3 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Home Loan Calculator
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/calculators/construction')}>
                    <Hammer className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Construction Cost
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/calculators/area')}>
                    <Layers className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Area Converter
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">Finance</DropdownMenuLabel>
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/investment')}>
                    <TrendingUp className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    {t('nav2.investment')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/pre-qualification')}>
                    <Shield className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Mortgage Pre-Qualification
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Discover Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className={`h-8 px-3 text-xs font-medium rounded-xl border ${navIconStyle} gap-1`}>
                    <Users className={`h-4 w-4 ${navIconColor}`} />
                    <span className="hidden xl:inline text-foreground/80">Discover</span>
                    <ChevronDown className="h-3 w-3 text-foreground/50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 bg-popover/95 backdrop-blur-2xl border-gold-primary/15 shadow-2xl z-[10001]">
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/agents')}>
                    <Users className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Find Agents
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/services')}>
                    <Settings2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    {t('nav.services')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/marketplace')}>
                    <Layers className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Marketplace
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/community')}>
                    <MessageSquare className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Community
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/areas')}>
                    <BookOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Area Guides
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/about')}>
                    <Compass className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    About Us
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer gap-2 hover:bg-gold-primary/10" onClick={() => navigate('/help')}>
                    <Bell className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Help Center
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Add Property */}
              <NavIconButton icon={Plus} label={t('nav2.addProperty')} onClick={() => navigate('/add-property')} showLabel />

              {/* Saved */}
              {user && (
                <NavIconButton icon={Heart} label="Saved" isActive={isActive('/saved')} onClick={() => navigate('/saved')} />
              )}

              {/* Dashboard links */}
              {user && !isAdmin && !isAgent && (
                <NavIconButton icon={BarChart3} label={t('nav.dashboard')} isActive={isActive('/dashboard/user')} onClick={() => navigate('/dashboard/user')} showLabel />
              )}

              {isAgent && (
                <Button variant="ghost" size="sm" className={cn("h-8 px-2.5 text-xs font-medium rounded-xl transition-all duration-300", isActive('/agent-dashboard') ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30" : "text-chart-1 hover:bg-chart-1/10")} onClick={() => navigate('/agent')}>
                  <User className="h-4 w-4 xl:mr-1" />
                  <span className="hidden xl:inline">Agent</span>
                </Button>
              )}

              {profile?.role === 'vendor' && (
                <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-medium text-accent-foreground hover:bg-accent/10 rounded-xl transition-all duration-300" onClick={() => navigate('/vendor')}>
                  <Settings className="h-4 w-4 xl:mr-1" />
                  <span className="hidden xl:inline">Vendor</span>
                </Button>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {pastHero && isHomePage && (
                <form onSubmit={handleHeaderSearch} className="flex items-center gap-1">
                  <div className="relative">
                    <Input type="text" value={headerSearchQuery} onChange={(e) => setHeaderSearchQuery(e.target.value)} placeholder={t('common.search') + '...'} className="px-3 h-7 sm:h-8 w-24 sm:w-32 lg:w-44 xl:w-56 text-[11px] sm:text-xs bg-muted/50 border-border/50 rounded-lg focus:bg-background focus:border-gold-primary/30 focus:w-36 sm:focus:w-44 lg:focus:w-56 transition-all duration-300" />
                  </div>
                  <Button type="submit" size="sm" className="h-7 sm:h-8 w-7 sm:w-8 p-0 rounded-lg bg-gold-primary hover:bg-gold-primary/90 text-background shrink-0">
                    <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </form>
              )}

              <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-8 h-8 p-0 rounded-xl bg-muted/50 border border-border/50 hover:bg-gold-primary/10 hover:border-gold-primary/30 hover:scale-105 transition-all duration-300">
                {theme === "light" ? <Moon className="h-4 w-4 text-foreground/70" /> : <Sun className="h-4 w-4 text-gold-primary" />}
              </Button>

              <div className="hidden lg:flex items-center gap-1.5">
                <CurrencySelector />
                <LanguageToggleSwitch />
              </div>

              {user && <NotificationDropdown />}

              {user ? (
                <UserIconWithBadge onNavigate={(path) => navigate(path)} />
              ) : (
                <div className="relative group">
                  <Button onClick={() => setShowAuthModal(true)} variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-xl bg-muted/50 border border-border/50 hover:bg-gold-primary/10 hover:border-gold-primary/30 hover:scale-105 transition-all duration-300 text-foreground/70 hover:text-gold-primary">
                    <User className="h-4 w-4" />
                  </Button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-foreground text-background text-[10px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-[10001] shadow-lg">
                    {t('auth.signIn')}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45 -mb-1" />
                  </div>
                </div>
              )}

              <div className="lg:hidden flex items-center">
                <Button ref={menuButtonRef} variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-xl bg-muted/50 border border-border/50 hover:bg-gold-primary/10 hover:border-gold-primary/30 transition-all duration-300 text-foreground/70" onClick={toggleMenu}>
                  {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <>
              <div className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] animate-in fade-in duration-200" onClick={() => setIsMenuOpen(false)} onTouchEnd={(e) => { e.preventDefault(); setIsMenuOpen(false); }} />
              
              <div ref={menuRef} className="lg:hidden absolute top-full right-0 w-64 max-w-[85vw] max-h-[75vh] overflow-y-auto overscroll-contain bg-popover/95 backdrop-blur-2xl border border-gold-primary/15 shadow-2xl z-[9999] rounded-b-2xl rounded-tl-lg animate-in slide-in-from-top-2 fade-in duration-300 origin-top-right">
                <div className="p-2 space-y-0.5">
                  <MobileNavButton icon={HomeIcon} label={t('nav.home')} active={isActive('/')} onClick={() => { navigate('/'); toggleMenu(); }} />

                  {/* Properties Section */}
                  <MobileSectionLabel>Properties</MobileSectionLabel>
                  {propertyNavItems.map((item) => (
                    <MobileNavButton key={item.path} icon={item.icon} label={item.label} active={isActive(item.path)} onClick={() => { navigate(item.path); toggleMenu(); }} indent />
                  ))}
                  <MobileNavButton icon={Box} label="VR Tours" active={isActive('/vr-tour')} onClick={() => { navigate('/vr-tour'); toggleMenu(); }} indent />
                  <MobileNavButton icon={Scale} label="Compare" active={isActive('/property-comparison')} onClick={() => { navigate('/property-comparison'); toggleMenu(); }} indent />
                  <MobileNavButton icon={MapPin} label={t('nav2.location')} active={isActive('/location')} onClick={() => { navigate('/location'); toggleMenu(); }} indent />
                  <MobileNavButton icon={Plus} label={t('nav2.addProperty')} onClick={() => { navigate('/add-property'); toggleMenu(); }} indent />

                  {/* Tools & Finance */}
                  <MobileSectionLabel>Tools & Finance</MobileSectionLabel>
                  <MobileNavButton icon={Calculator} label="AI Price Estimator" active={isActive('/ai-pricing')} onClick={() => { navigate('/ai-pricing'); toggleMenu(); }} indent />
                  <MobileNavButton icon={BarChart3} label="Loan Calculator" active={isActive('/calculators/loan')} onClick={() => { navigate('/calculators/loan'); toggleMenu(); }} indent />
                  <MobileNavButton icon={Hammer} label="Construction Cost" active={isActive('/calculators/construction')} onClick={() => { navigate('/calculators/construction'); toggleMenu(); }} indent />
                  <MobileNavButton icon={TrendingUp} label={t('nav2.investment')} active={isActive('/investment')} onClick={() => { navigate('/investment'); toggleMenu(); }} indent />
                  <MobileNavButton icon={Shield} label="Pre-Qualification" active={isActive('/pre-qualification')} onClick={() => { navigate('/pre-qualification'); toggleMenu(); }} indent />

                  {/* Discover */}
                  <MobileSectionLabel>Discover</MobileSectionLabel>
                  <MobileNavButton icon={Users} label="Find Agents" active={isActive('/agents')} onClick={() => { navigate('/agents'); toggleMenu(); }} indent />
                  <MobileNavButton icon={Settings2} label={t('nav.services')} active={isActive('/services')} onClick={() => { navigate('/services'); toggleMenu(); }} indent />
                  <MobileNavButton icon={Layers} label="Marketplace" active={isActive('/marketplace')} onClick={() => { navigate('/marketplace'); toggleMenu(); }} indent />
                  <MobileNavButton icon={MessageSquare} label="Community" active={isActive('/community')} onClick={() => { navigate('/community'); toggleMenu(); }} indent />
                  <MobileNavButton icon={BookOpen} label="Area Guides" active={isActive('/areas')} onClick={() => { navigate('/areas'); toggleMenu(); }} indent />

                  {/* User Section */}
                  {user && (
                    <>
                      <MobileSectionLabel>Account</MobileSectionLabel>
                      {user && !isAdmin && !isAgent && (
                        <MobileNavButton icon={BarChart3} label={t('nav.dashboard')} active={isActive('/dashboard/user')} onClick={() => { navigate('/dashboard/user'); toggleMenu(); }} indent />
                      )}
                      <MobileNavButton icon={Heart} label="Saved Properties" active={isActive('/saved')} onClick={() => { navigate('/saved'); toggleMenu(); }} indent />
                      <MobileNavButton icon={MessageSquare} label="Messages" active={isActive('/messages')} onClick={() => { navigate('/messages'); toggleMenu(); }} indent />
                      {isAgent && (
                        <MobileNavButton icon={User} label={t('nav.agentDashboard')} colorClass="text-chart-1" active={isActive('/agent-dashboard')} onClick={() => { navigate('/agent'); toggleMenu(); }} indent />
                      )}
                      {profile?.role === 'vendor' && (
                        <MobileNavButton icon={Settings} label={t('nav.vendorDashboard')} colorClass="text-accent-foreground" onClick={() => { navigate('/vendor'); toggleMenu(); }} indent />
                      )}
                    </>
                  )}
                  
                  <div className="flex items-center justify-between pt-1.5 border-t border-gold-primary/10 gap-1">
                    <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-7 text-[11px] text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-lg">
                      {theme === "light" ? <Moon className="h-3 w-3 mr-1" /> : <Sun className="h-3 w-3 mr-1" />}
                      {theme === "light" ? "Dark" : "Light"}
                    </Button>
                    <CurrencySelector />
                    <LanguageToggleSwitch />
                  </div>
                  {user && (
                    <Button variant="ghost" className="w-full justify-start h-8 text-[11px] font-medium text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={handleSignOut}>
                      <LogOut className="h-3 w-3 mr-1.5" />
                      {t('auth.signOut')}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      <EnhancedAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} language={language} />
    </>
  );
};

/* ── Reusable nav sub-components ── */

const NavIconButton: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  showLabel?: boolean;
}> = ({ icon: Icon, label, onClick, isActive, showLabel }) => (
  <div className="relative group">
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 rounded-xl border transition-all duration-300",
        showLabel ? "px-3 text-xs font-medium" : "w-8 p-0",
        isActive
          ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
          : "bg-muted/50 border-border/50 hover:bg-gold-primary/10 hover:border-gold-primary/30 hover:scale-105"
      )}
      onClick={onClick}
    >
      <Icon className={cn("h-4 w-4", showLabel && "xl:mr-1.5", isActive ? "text-amber-600 dark:text-amber-400" : "text-foreground/70")} />
      {showLabel && <span className="hidden xl:inline text-foreground/80">{label}</span>}
    </Button>
    {!showLabel && (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-foreground text-background text-[10px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-[10001] shadow-lg">
        {label}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45 -mb-1" />
      </div>
    )}
  </div>
);

const MobileSectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border-t border-gold-primary/10 pt-1.5 mt-1.5">
    <div className="px-2 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
      <span className="h-1 w-1 rounded-full bg-amber-500" />
      {children}
    </div>
  </div>
);

const MobileNavButton: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  colorClass?: string;
  indent?: boolean;
  active?: boolean;
}> = ({ icon: Icon, label, onClick, colorClass, indent, active }) => (
  <Button
    variant="ghost"
    className={cn(
      "w-full justify-start h-10 text-xs font-medium rounded-lg touch-manipulation transition-all",
      active
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
        : colorClass || "text-foreground/70 hover:text-foreground hover:bg-muted/50",
      indent && "pl-4"
    )}
    onClick={onClick}
  >
    <Icon className={cn("h-3.5 w-3.5 mr-1.5 flex-shrink-0", active && "text-amber-600 dark:text-amber-400")} />
    {label}
  </Button>
);

export default Navigation;
