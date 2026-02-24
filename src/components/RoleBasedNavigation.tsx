import { Button } from "@/components/ui/button";
import { Sun, Moon, Globe, Menu, User, LogOut, Settings, Home, Wallet } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

interface RoleBasedNavigationProps {
  onLoginClick: () => void;
  language: "en" | "id" | "zh" | "ja" | "ko";
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
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      setIsMenuOpen(false);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!profile) return '/dashboard';
    switch (profile.role) {
      case 'property_owner': return '/dashboard/user';
      case 'agent': return '/dashboard/agent';
      case 'vendor': return '/vendor';
      case 'admin': return '/dashboard/admin';
      case 'general_user':
      default: return '/dashboard/user';
    }
  };

  const getRoleSpecificMenuItems = () => {
    if (!profile) return [];
    const baseItems: { label: string; route: string }[] = [];
    switch (profile.role) {
      case 'property_owner':
        baseItems.push({ label: t('roleNav.myProperties'), route: '/dashboard/owner/properties' });
        break;
      case 'agent':
        baseItems.push({ label: t('roleNav.myListings'), route: '/dashboard/agent/listings' });
        break;
      case 'vendor':
        baseItems.push({ label: t('roleNav.myServices'), route: '/vendor' });
        break;
      case 'admin':
        baseItems.push({ label: t('roleNav.adminPanel'), route: '/dashboard/admin' });
        break;
    }
    if (profile.role !== 'vendor') {
      baseItems.push({ label: 'Villa Realty', route: '/wallet' });
    }
    return baseItems;
  };

  const getVendorMenuItems = () => {
    if (!user) return [];
    if (profile?.role === 'vendor') {
      return [{ label: t('roleNav.vendorDashboard'), route: '/vendor' }];
    } else {
      return [{ label: t('roleNav.becomeVendor'), route: '/vendor/register' }];
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(name => name.charAt(0)).join('').toUpperCase().substring(0, 2);
    }
    return profile?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 header-ios border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="flex justify-between items-center h-12">
          <div className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleHomeClick}>
            <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent drop-shadow-lg">
              Astra Villa
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onLanguageToggle} className="header-button-ios px-2 py-1 h-8">
              <Globe className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs font-medium">{language.toUpperCase()}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onThemeToggle} className="header-button-ios px-2 py-1 h-8">
              {theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </Button>

            {isAuthenticated && user && profile ? (
              <div className="flex items-center space-x-2">
                <HoverCard openDelay={300} closeDelay={200}>
                  <DropdownMenu modal={false}>
                    <HoverCardTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="header-button-ios flex items-center space-x-2 px-2 py-1 h-8">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                            <AvatarFallback className="text-xs bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/20">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden md:block text-xs font-medium text-primary-foreground">
                            {profile.full_name || profile.email}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                    </HoverCardTrigger>
                    <HoverCardContent side="bottom" align="end" className="w-64 p-4 backdrop-blur-xl bg-popover border-border/30 shadow-xl">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                          <AvatarFallback className="text-xs bg-primary-foreground/20 text-primary-foreground">{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-semibold text-foreground">{profile.full_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{profile.email}</p>
                          <Badge variant="secondary" className="text-[10px] w-fit mt-0.5 capitalize">{profile.role.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                    </HoverCardContent>
                    <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border border-border/20 shadow-xl rounded-2xl">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium text-foreground">{profile.full_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{profile.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">{profile.role.replace('_', ' ')}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="border-border" />
                      <DropdownMenuItem onClick={() => navigate(getDashboardRoute())} className="text-foreground hover:bg-primary/10">
                        {t('roleNav.dashboard')}
                      </DropdownMenuItem>
                      {profile.role !== 'vendor' && (
                        <DropdownMenuItem onClick={() => navigate('/wallet')} className="text-foreground hover:bg-primary/10">
                          <Wallet className="h-4 w-4 mr-2" />
                          {t('roleNav.wallet')}
                        </DropdownMenuItem>
                      )}
                      {getRoleSpecificMenuItems().map((item, index) => (
                        <DropdownMenuItem key={index} onClick={() => navigate(item.route)} className="text-foreground hover:bg-primary/10">
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                      {getVendorMenuItems().map((item, index) => (
                        <DropdownMenuItem key={`vendor-${index}`} onClick={() => navigate(item.route)} className="text-foreground hover:bg-primary/10">
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="border-border" />
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive hover:bg-destructive/10">
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('roleNav.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </HoverCard>
              </div>
            ) : (
              <Button onClick={onLoginClick} size="sm" className="header-button-ios px-3 py-1 h-8">
                <User className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">{t('roleNav.loginRegister')}</span>
              </Button>
            )}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="header-button-ios">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/20 shadow-2xl rounded-b-2xl">
            <div className="px-4 pt-4 pb-6 space-y-3">
              <div className="flex justify-between items-center p-3 border-b border-border/50 bg-muted/50 rounded-xl">
                <Button variant="ghost" size="sm" onClick={onLanguageToggle} className="flex-1 mr-2 bg-card/70 hover:bg-card/90 text-foreground border border-border/50 rounded-lg">
                  <Globe className="h-4 w-4 mr-1" />
                  {language.toUpperCase()}
                </Button>
                <Button variant="ghost" size="sm" onClick={onThemeToggle} className="flex-1 bg-card/70 hover:bg-card/90 text-foreground border border-border/50 rounded-lg">
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
              </div>

              {isAuthenticated && user && profile ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 border-b border-border/30">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                        <AvatarFallback className="text-sm">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{profile.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => { navigate(getDashboardRoute()); setIsMenuOpen(false); }} className="w-full justify-start">
                    {t('roleNav.dashboard')}
                  </Button>
                  {profile.role !== 'vendor' && (
                    <Button variant="ghost" onClick={() => { navigate('/wallet'); setIsMenuOpen(false); }} className="w-full justify-start">
                      <Wallet className="h-4 w-4 mr-2" />
                      {t('roleNav.wallet')}
                    </Button>
                  )}
                  {getRoleSpecificMenuItems().map((item, index) => (
                    <Button key={index} variant="ghost" onClick={() => { navigate(item.route); setIsMenuOpen(false); }} className="w-full justify-start">
                      {item.label}
                    </Button>
                  ))}
                  {getVendorMenuItems().map((item, index) => (
                    <Button key={`vendor-mobile-${index}`} variant="ghost" onClick={() => { navigate(item.route); setIsMenuOpen(false); }} className="w-full justify-start">
                      {item.label}
                    </Button>
                  ))}
                  <Button variant="ghost" onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="w-full justify-start text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('roleNav.logout')}
                  </Button>
                </div>
              ) : (
                <Button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="w-full justify-start" variant="ghost">
                  <User className="h-4 w-4 mr-2" />
                  {t('roleNav.loginRegister')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;
