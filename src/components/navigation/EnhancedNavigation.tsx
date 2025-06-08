
import { Button } from "@/components/ui/button";
import { Globe, Menu, User, LogOut, Settings, Bell, Home, ArrowUp, MessageCircle, Sparkles, Bot, LogIn, UserPlus, Lock, Unlock, Plus, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import ThemeToggleBar from "../ThemeToggleBar";

interface EnhancedNavigationProps {
  onLoginClick?: () => void;
  language: "en" | "id";
  onLanguageToggle: () => void;
}

const EnhancedNavigation = ({ 
  onLoginClick,
  language, 
  onLanguageToggle
}: EnhancedNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const { theme } = useTheme();
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
      postAdvertising: "Post Advertising",
      help: "Help",
      loginRegister: "Login / Register",
      login: "Login",
      register: "Register",
      dashboard: "Dashboard",
      profile: "Profile",
      settings: "Settings",
      notifications: "Notifications",
      logout: "Sign Out",
      chat: "AI Chat",
      scrollTop: "Back to Top",
      english: "English",
      indonesian: "Indonesian",
      lightMode: "Light Mode",
      middleMode: "Middle Mode",
      darkMode: "Dark Mode",
      loginRequired: "Please login to access this feature",
      addProperty: "Add Property"
    },
    id: {
      home: "Beranda",
      postAdvertising: "Pasang Iklan",
      help: "Bantuan",
      loginRegister: "Masuk / Daftar",
      login: "Masuk",
      register: "Daftar",
      dashboard: "Dashboard",
      profile: "Profil",
      settings: "Pengaturan",
      notifications: "Notifikasi",
      logout: "Keluar",
      chat: "Chat AI",
      scrollTop: "Kembali ke Atas",
      english: "Bahasa Inggris",
      indonesian: "Bahasa Indonesia",
      lightMode: "Mode Terang",
      middleMode: "Mode Tengah",
      darkMode: "Mode Gelap",
      loginRequired: "Silakan login untuk mengakses fitur ini",
      addProperty: "Tambah Properti"
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

  const handlePostAdvertisingClick = () => {
    if (!isAuthenticated) {
      alert(currentText.loginRequired);
      onLoginClick?.();
      return;
    }
    // Navigate to property listing page (will be implemented)
    navigate('/dashboard?tab=properties');
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

  const handleLoginDropdownClick = () => {
    setIsLoginDropdownOpen(!isLoginDropdownOpen);
  };

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled 
          ? 'bg-background/70 backdrop-blur-md' 
          : 'bg-background/95 backdrop-blur-sm'
        }
        border-b border-border/20
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
                  <Bot className="h-8 w-8 text-primary animate-pulse" style={{ animationDuration: '3s' }} />
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-bounce" style={{ animationDuration: '2.5s' }} />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent animate-pulse drop-shadow-md" style={{ animationDuration: '4s' }}>
                  Astra Villa
                </h1>
              </div>
            </div>

            {/* Desktop Navigation - Updated with new buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="glass-ios rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 text-foreground/90 hover:text-foreground hover:bg-foreground/10"
              >
                <Home className="h-4 w-4 mr-2" />
                {currentText.home}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handlePostAdvertisingClick}
                className="glass-ios rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 text-foreground/90 hover:text-foreground hover:bg-foreground/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                {currentText.postAdvertising}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/help')}
                className="glass-ios rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 text-foreground/90 hover:text-foreground hover:bg-foreground/10"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                {currentText.help}
              </Button>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle Bar - 3 Step Selection */}
              <div className="hidden lg:block">
                <ThemeToggleBar language={language} />
              </div>

              {/* Language Toggle with Country Flags */}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLanguageToggle}
                    className="hidden sm:flex items-center space-x-1 glass-ios rounded-full px-3 py-2 text-foreground/90 hover:text-foreground hover:bg-foreground/10"
                  >
                    <span className="text-lg">
                      {language === 'en' ? '🇺🇸' : '🇮🇩'}
                    </span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Language / Bahasa</h4>
                    <div className="flex items-center space-x-2">
                      <span>🇺🇸</span>
                      <span className="text-sm">{currentText.english}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>🇮🇩</span>
                      <span className="text-sm">{currentText.indonesian}</span>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>

              {/* AI Chat Bot Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChatBot(!showChatBot)}
                className="hidden sm:flex glass-ios rounded-full p-2 relative text-foreground/90 hover:text-foreground hover:bg-foreground/10"
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
                    className="hidden sm:flex relative glass-ios rounded-full p-2 text-foreground/90 hover:text-foreground hover:bg-foreground/10"
                  >
                    <Bell className="h-4 w-4" />
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                      2
                    </Badge>
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 p-2 glass-ios rounded-full text-foreground/90 hover:text-foreground hover:bg-foreground/10">
                        <Avatar className="h-8 w-8 ring-2 ring-white/20">
                          <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                          <AvatarFallback className="text-sm bg-primary text-primary-foreground">
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
                  {/* iPhone-style Unlock Button */}
                  <DropdownMenu open={isLoginDropdownOpen} onOpenChange={setIsLoginDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        onClick={handleLoginDropdownClick}
                        className="relative group glass-ios rounded-full w-12 h-12 p-0 border-2 transition-all duration-300 hover:scale-110 bg-gradient-to-br from-card to-muted border-border hover:border-primary/40 shadow-lg hover:shadow-primary/20"
                      >
                        <div className="relative">
                          {isLoginDropdownOpen ? (
                            <Unlock className="h-5 w-5 transition-colors duration-200 text-green-500" />
                          ) : (
                            <Lock className="h-5 w-5 transition-colors duration-200 text-muted-foreground" />
                          )}
                          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                            isLoginDropdownOpen 
                              ? 'bg-green-500/20 animate-pulse' 
                              : 'bg-transparent group-hover:bg-primary/10'
                          }`} />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 mt-2">
                      <DropdownMenuItem onClick={() => { onLoginClick?.(); setIsLoginDropdownOpen(false); }}>
                        <LogIn className="h-4 w-4 mr-2" />
                        {currentText.login}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { onLoginClick?.(); setIsLoginDropdownOpen(false); }}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {currentText.register}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden glass-ios rounded-full p-2 text-foreground/90 hover:text-foreground hover:bg-foreground/10"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border/20 bg-background/95">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button 
                  onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-foreground/90 hover:text-foreground hover:bg-foreground/10"
                >
                  <Home className="h-4 w-4 inline mr-2" />
                  {currentText.home}
                </button>
                
                <button 
                  onClick={() => { handlePostAdvertisingClick(); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-foreground/90 hover:text-foreground hover:bg-foreground/10"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  {currentText.postAdvertising}
                </button>

                <button 
                  onClick={() => { navigate('/help'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-foreground/90 hover:text-foreground hover:bg-foreground/10"
                >
                  <HelpCircle className="h-4 w-4 inline mr-2" />
                  {currentText.help}
                </button>

                {/* Mobile Theme Toggle */}
                <div className="px-3 py-2">
                  <ThemeToggleBar language={language} />
                </div>
                
                {!isAuthenticated ? (
                  <div className="px-3 py-2 space-y-2">
                    <Button 
                      onClick={() => { onLoginClick?.(); setIsMenuOpen(false); }} 
                      className="w-full backdrop-blur-sm bg-primary/20 text-primary-foreground border-primary/30 hover:bg-primary/30"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {currentText.login}
                    </Button>
                    <Button 
                      onClick={() => { onLoginClick?.(); setIsMenuOpen(false); }} 
                      variant="outline"
                      className="w-full backdrop-blur-sm border-border/30 text-foreground hover:bg-foreground/10"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {currentText.register}
                    </Button>
                  </div>
                ) : (
                  <div className="px-3 py-2 space-y-2 border-t border-border/20 mt-2 pt-2">
                    <div className="flex items-center space-x-3 mb-2">
                      <Avatar className="h-8 w-8 ring-2 ring-white/20">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                        <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{profile?.full_name || 'User'}</p>
                        <p className="text-xs capitalize text-muted-foreground">{profile?.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => { navigate(getDashboardRoute()); setIsMenuOpen(false); }} className="w-full justify-start text-foreground/90 hover:text-foreground hover:bg-foreground/10">
                      <User className="h-4 w-4 mr-2" />
                      {currentText.dashboard}
                    </Button>
                    <Button variant="ghost" onClick={() => { navigate('/dashboard?tab=notifications'); setIsMenuOpen(false); }} className="w-full justify-start text-foreground/90 hover:text-foreground hover:bg-foreground/10">
                      <Bell className="h-4 w-4 mr-2" />
                      {currentText.notifications}
                      <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 text-xs">2</Badge>
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={handleSignOut} 
                      className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/20"
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
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowChatBot(false)}>
                ×
              </Button>
            </div>
          </div>
          <div className="p-4 h-80 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Bot className="h-6 w-6 text-primary mt-1" />
                <div className="bg-muted/50 rounded-lg p-3 max-w-xs">
                  <p className="text-sm">
                    {language === 'en' 
                      ? "Hello! I'm your AI assistant. How can I help you find the perfect property today?" 
                      : "Halo! Saya asisten AI Anda. Bagaimana saya bisa membantu Anda menemukan properti yang sempurna hari ini?"
                    }
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  {language === 'en' ? 'AI Chat Bot is ready to help!' : 'AI Chat Bot siap membantu!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedNavigation;
