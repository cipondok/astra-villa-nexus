
import { Button } from "@/components/ui/button";
import { Sun, Moon, Globe, Menu, User, LogOut, Settings, Bell, Home, ArrowUp, MessageCircle, Sparkles, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { Badge } from "@/components/ui/badge";

interface EnhancedNavigationProps {
  onLoginClick?: () => void;
  language: "en" | "id";
  onLanguageToggle: () => void;
  theme: string;
  onThemeToggle: () => void;
}

const EnhancedNavigation = ({ 
  onLoginClick,
  language, 
  onLanguageToggle, 
  theme, 
  onThemeToggle 
}: EnhancedNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const text = {
    en: {
      home: "Home",
      loginRegister: "Login / Register",
      dashboard: "Dashboard",
      profile: "Profile",
      settings: "Settings",
      notifications: "Notifications",
      logout: "Sign Out",
      chat: "AI Chat",
      scrollTop: "Back to Top"
    },
    id: {
      home: "Beranda",
      loginRegister: "Masuk / Daftar",
      dashboard: "Dashboard",
      profile: "Profil",
      settings: "Pengaturan",
      notifications: "Notifikasi",
      logout: "Keluar",
      chat: "Chat AI",
      scrollTop: "Kembali ke Atas"
    }
  };

  const currentText = text[language];

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleAlerts = () => {
    setAlertsOpen(!alertsOpen);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${theme === 'dark' 
          ? (isScrolled 
            ? 'bg-blue-titanium/70 dark:bg-blue-titanium-dark/70 backdrop-blur-md' 
            : 'bg-blue-titanium-light/95 dark:bg-blue-titanium/95 backdrop-blur-sm')
          : (isScrolled
            ? 'bg-blue-sky-transparent backdrop-blur-md'
            : 'bg-blue-sky-light-transparent backdrop-blur-sm')
        }
        border-b ${theme === 'dark' 
          ? 'border-blue-titanium/20 dark:border-blue-titanium-light/20'
          : 'border-blue-sky/30'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Animated Colorful Logo */}
            <div 
              className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105" 
              onClick={() => navigate('/')}
            >
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Bot className="h-8 w-8 text-primary animate-pulse" />
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-bounce" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent animate-pulse drop-shadow-md">
                  Astra Villa
                </h1>
              </div>
            </div>

            {/* Desktop Navigation - Soft Button Style */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className={`glass-ios rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 ${
                  theme === 'dark'
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-blue-titanium-dark hover:text-blue-titanium hover:bg-blue-titanium/10'
                }`}
              >
                <Home className="h-4 w-4 mr-2" />
                {currentText.home}
              </Button>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onLanguageToggle}
                className={`hidden sm:flex items-center space-x-1 glass-ios rounded-full px-3 py-2 ${
                  theme === 'dark'
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-blue-titanium-dark hover:text-blue-titanium hover:bg-blue-titanium/10'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onThemeToggle}
                className={`hidden sm:flex glass-ios rounded-full p-2 ${
                  theme === 'dark'
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-blue-titanium-dark hover:text-blue-titanium hover:bg-blue-titanium/10'
                }`}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

              {/* AI Chat Bot Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChatBot(!showChatBot)}
                className={`hidden sm:flex glass-ios rounded-full p-2 relative ${
                  theme === 'dark'
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-blue-titanium-dark hover:text-blue-titanium hover:bg-blue-titanium/10'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              </Button>

              {isAuthenticated && user && profile ? (
                <>
                  {/* Notifications Alert Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAlerts}
                    className={`hidden sm:flex relative glass-ios rounded-full p-2 ${
                      theme === 'dark'
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-blue-titanium-dark hover:text-blue-titanium hover:bg-blue-titanium/10'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                      2
                    </Badge>
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className={`flex items-center space-x-2 p-2 glass-ios rounded-full ${
                        theme === 'dark'
                          ? 'text-white/90 hover:text-white hover:bg-white/10'
                          : 'text-blue-titanium-dark hover:text-blue-titanium hover:bg-blue-titanium/10'
                      }`}>
                        <Avatar className="h-8 w-8 ring-2 ring-white/20">
                          <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                          <AvatarFallback className="text-sm bg-blue-titanium text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden md:block text-sm font-medium">
                          {profile?.full_name || 'User'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {profile?.role.replace('_', ' ')}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/')}>
                        <Home className="h-4 w-4 mr-2" />
                        {currentText.home}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
                        <User className="h-4 w-4 mr-2" />
                        {currentText.dashboard}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/dashboard?tab=profile')}>
                        <User className="h-4 w-4 mr-2" />
                        {currentText.profile}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/dashboard?tab=settings')}>
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
                </>
              ) : (
                <div className="hidden md:flex items-center">
                  <Button 
                    className={`glass-ios rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 ${
                      theme === 'dark'
                        ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                        : 'bg-blue-titanium/20 text-blue-titanium-dark border-blue-titanium/30 hover:bg-blue-titanium/30'
                    }`}
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
                className={`md:hidden glass-ios rounded-full p-2 ${
                  theme === 'dark'
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-blue-titanium-dark hover:text-blue-titanium hover:bg-blue-titanium/10'
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className={`md:hidden border-t border-white/20 ${
              theme === 'dark'
                ? 'bg-blue-titanium/95 dark:bg-blue-titanium-dark/95'
                : 'bg-blue-sky-light-transparent'
            }`}>
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button 
                  onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-md ${
                    theme === 'dark'
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-blue-titanium-dark hover:text-blue-titanium hover:bg-blue-titanium/10'
                  }`}
                >
                  {currentText.home}
                </button>
                
                {!isAuthenticated ? (
                  <div className="px-3 py-2">
                    <Button onClick={onLoginClick} className={`w-full backdrop-blur-sm ${
                      theme === 'dark'
                        ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                        : 'bg-blue-titanium/20 text-blue-titanium-dark border-blue-titanium/30 hover:bg-blue-titanium/30'
                    }`}>
                      {currentText.loginRegister}
                    </Button>
                  </div>
                ) : (
                  <div className="px-3 py-2 space-y-2 border-t border-white/20 mt-2 pt-2">
                    <div className="flex items-center space-x-3 mb-2">
                      <Avatar className="h-8 w-8 ring-2 ring-white/20">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                        <AvatarFallback className="text-sm bg-blue-titanium text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-blue-titanium-dark'
                        }`}>{profile?.full_name || 'User'}</p>
                        <p className={`text-xs capitalize ${
                          theme === 'dark' ? 'text-white/70' : 'text-blue-titanium'
                        }`}>{profile?.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => { navigate(getDashboardRoute()); setIsMenuOpen(false); }} className={`w-full justify-start ${
                      theme === 'dark'
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-blue-titanium-dark hover:text-blue-titanium hover:bg-blue-titanium/10'
                    }`}>
                      <User className="h-4 w-4 mr-2" />
                      {currentText.dashboard}
                    </Button>
                    <Button variant="ghost" onClick={() => { navigate('/dashboard?tab=notifications'); setIsMenuOpen(false); }} className={`w-full justify-start ${
                      theme === 'dark'
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-blue-titanium-dark hover:text-blue-titanium hover:bg-blue-titanium/10'
                    }`}>
                      <Bell className="h-4 w-4 mr-2" />
                      {currentText.notifications}
                      <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 text-xs">2</Badge>
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={handleSignOut} 
                      className="w-full justify-start text-red-200 hover:text-red-100 hover:bg-red-500/20"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {currentText.logout}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Click outside to close alerts */}
        {alertsOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setAlertsOpen(false)}
          />
        )}
      </nav>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 glass-ios rounded-full p-3 shadow-lg animate-bounce"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* AI Chat Bot */}
      {showChatBot && (
        <div className="fixed bottom-6 left-6 z-50 w-80 h-96 glass-ios rounded-2xl shadow-2xl border border-border/30">
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{currentText.chat}</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowChatBot(false)}>
                ×
              </Button>
            </div>
          </div>
          <div className="p-4 h-80 overflow-y-auto">
            <p className="text-sm text-muted-foreground">AI Chat Bot interface will be implemented here.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedNavigation;
