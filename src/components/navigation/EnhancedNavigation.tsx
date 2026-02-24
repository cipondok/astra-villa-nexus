import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Shield, Headphones, Glasses, MapPin } from "lucide-react";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeSettings } from "@/contexts/ThemeSettingsContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggleSwitch from "@/components/ThemeToggleSwitch";
import AnimatedLogo from "@/components/AnimatedLogo";
import { useTranslation } from "@/i18n/useTranslation";

interface EnhancedNavigationProps {
  onLoginClick?: () => void;
  language: "en" | "id" | "zh" | "ja" | "ko";
  onLanguageToggle: () => void;
}

const EnhancedNavigation = ({ onLoginClick, language, onLanguageToggle }: EnhancedNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, profile } = useAuth();
  const { themeSettings } = useThemeSettings();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu when clicking outside (robust on mobile + desktop)
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!isOpen) return;
      const target = event.target as Node | null;
      if (!target) return;
      const isInsideMenu = mobileMenuRef.current?.contains(target);
      const isMenuButton = menuButtonRef.current?.contains(target);
      if (!isInsideMenu && !isMenuButton) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const { data: headerLogoUrl } = useQuery({
    queryKey: ["system-setting", "headerLogo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("category", "general")
        .eq("key", "headerLogo")
        .maybeSingle();
      if (error) return null;
      return (data?.value as string) || null;
    },
    staleTime: 5_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: adminData } = useQuery({
    queryKey: ["admin-status", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  const navItems = [
    { name: t('nav.home'), path: "/", icon: undefined },
    { name: t('nav2.location'), path: "/location", icon: MapPin },
    { name: t('nav2.vrTour'), path: "/vr-tour", icon: Glasses },
    { name: t('nav.about'), path: "/about", icon: undefined },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setIsOpen(false);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 nav-ios backdrop-blur-md bg-background/95 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
        <div className="flex justify-between items-center h-12 md:h-14 lg:h-16">
          {/* Animated Logo - Left Corner */}
          <Link to="/" className="flex-shrink-0 -ml-2">
            <AnimatedLogo src={headerLogoUrl} alt="ASTRA Villa" size="lg" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                title={item.name}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
              >
                {item.icon && <item.icon className="h-3.5 w-3.5" />}
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <div className="scale-90 md:scale-100">
              <ThemeToggleSwitch language={language} />
            </div>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLanguageToggle}
              title={language === 'en' ? 'Switch to Indonesian' : 'Ganti ke Bahasa Inggris'}
              className="text-muted-foreground hover:text-foreground border border-border/30 hover:bg-foreground/10 transition-all duration-200 h-8 px-2.5 text-xs md:h-9 md:px-3 md:text-sm"
            >
              {t('nav2.languageToggle')}
            </Button>

            {/* Notification Center */}
            {user && <NotificationCenter />}

            {/* User Actions */}
            {user ? (
              <div className="flex items-center space-x-2">
                {adminData && (
                  <Button
                    onClick={handleAdminClick}
                    variant="ghost"
                    size="sm"
                    title={t('nav.adminPanel')}
                    className="bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 transition-all duration-300 h-8 px-2.5 md:h-9 md:px-3"
                  >
                    <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden sm:inline text-xs md:text-sm">{t('nav.adminPanel')}</span>
                  </Button>
                )}
                
                {profile?.role === 'customer_service' && (
                  <Button
                    onClick={() => navigate('/dashboard/customer-service')}
                    variant="default"
                    size="sm"
                    title="Customer Service Dashboard"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm"
                  >
                    <Headphones className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden sm:inline">CS</span>
                    <span className="hidden md:inline ml-1">Dashboard</span>
                  </Button>
                )}
                
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  title={t('auth.signOut')}
                  className="text-muted-foreground hover:text-foreground border border-border/30 hover:bg-foreground/10 transition-all duration-200 h-8 px-2.5 md:h-9 md:px-3"
                >
                  <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden sm:inline text-xs md:text-sm">{t('auth.signOut')}</span>
                </Button>
              </div>
            ) : (
              onLoginClick && (
                  <Button
                    onClick={onLoginClick}
                    size="sm"
                    className="btn-primary-ios h-8 px-3 text-xs md:h-9 md:px-4"
                  >
                    {t('auth.signIn')}
                  </Button>
              )
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                ref={menuButtonRef}
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? (language === 'en' ? 'Close menu' : 'Tutup menu') : (language === 'en' ? 'Open menu' : 'Buka menu')}
                className="text-muted-foreground hover:text-foreground border border-border/30 hover:bg-foreground/10 h-8 w-8 p-0 md:h-9 md:w-9"
              >
                {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div 
          ref={mobileMenuRef}
          className="lg:hidden dropdown-ios border-t border-border/30 mt-2 mx-3 mb-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                title={item.name}
                className="flex items-center gap-2 w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-2"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.name}
              </button>
            ))}
            
            {user ? (
              <div className="space-y-2 pt-3 border-t border-border/30">
                {adminData && (
                  <Button
                    onClick={handleAdminClick}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start bg-destructive/10 hover:bg-destructive/20 text-destructive h-9 text-sm"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {t('nav.adminPanel')}
                  </Button>
                )}
                
                {profile?.role === 'customer_service' && (
                  <Button
                    onClick={() => {
                      navigate('/dashboard/customer-service');
                      setIsOpen(false);
                    }}
                    variant="default"
                    size="sm"
                    className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-9 text-sm"
                  >
                    <Headphones className="h-4 w-4 mr-2" />
                    CS Dashboard
                  </Button>
                )}
                
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground h-9 text-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('auth.signOut')}
                </Button>
              </div>
            ) : (
              onLoginClick && (
                <div className="pt-3 border-t border-border/30">
                  <Button
                    onClick={() => {
                      onLoginClick();
                      setIsOpen(false);
                    }}
                    size="sm"
                    className="w-full btn-primary-ios h-9 text-sm"
                  >
                    {t('auth.signIn')}
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default EnhancedNavigation;
