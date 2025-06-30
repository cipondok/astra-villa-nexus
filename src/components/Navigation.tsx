
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Settings, LogOut, Crown, Moon, Sun, Sparkles, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import LanguageToggleSwitch from "./LanguageToggleSwitch";
import AuthModal from "./AuthModal";
import { useNavigate, useLocation } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
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
      dashboard: "Dashboard",
      signIn: "Sign In",
      signOut: "Sign Out",
      user: "User",
      adminPanel: "Admin Panel",
      settings: "Settings",
      properties: "Properties",
      saved: "Saved",
      messages: "Messages"
    },
    id: {
      home: "Beranda",
      services: "Layanan",
      dashboard: "Dasbor",
      signIn: "Masuk",
      signOut: "Keluar",
      user: "Pengguna",
      adminPanel: "Panel Admin",
      settings: "Pengaturan",
      properties: "Properti",
      saved: "Disimpan",
      messages: "Pesan"
    }
  };

  const currentText = text[language] || text.en;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50' 
          : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11">
            {/* ASTRA Villa Logo - Compact */}
            <div 
              className="flex items-center space-x-2 cursor-pointer group" 
              onClick={() => navigate('/')}
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Brain className="h-3 w-3 text-primary-foreground" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-base font-semibold apple-text-gradient">ASTRA</span>
                <span className="text-base font-semibold text-foreground">Villa</span>
              </div>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-full transition-all"
                onClick={() => navigate('/')}
              >
                {currentText.home}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-full transition-all"
                onClick={() => navigate('/services')}
              >
                {currentText.services}
              </Button>
              {user && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 px-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-full transition-all"
                  onClick={() => navigate('/dashboard')}
                >
                  {currentText.dashboard}
                </Button>
              )}
              {profile?.role === 'admin' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 px-3 text-sm font-medium text-accent hover:text-accent/80 hover:bg-accent/10 rounded-full transition-all"
                  onClick={() => navigate('/admin')}
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </Button>
              )}
            </div>

            {/* Right Section - Compact Controls */}
            <div className="flex items-center space-x-2">
              {/* Smart AI Icon - Smaller */}
              <div className="w-6 h-6 rounded-md bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-primary" />
              </div>

              {/* Dark Mode Toggle - Compact */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-6 h-6 p-0 rounded-md bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all"
              >
                {theme === "light" ? (
                  <Moon className="h-3 w-3" />
                ) : (
                  <Sun className="h-3 w-3" />
                )}
              </Button>

              {/* Language Toggle - Hidden on mobile */}
              <div className="hidden md:block">
                <LanguageToggleSwitch />
              </div>

              {/* User Section - Compact */}
              {user ? (
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                    <User className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSignOut}
                    className="w-6 h-6 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  size="sm"
                  className="h-8 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full transition-all"
                >
                  {currentText.signIn}
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden w-6 h-6 p-0 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation - Slide down */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 shadow-lg">
              <div className="px-4 py-3 space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm font-medium" onClick={() => { navigate('/'); toggleMenu(); }}>
                  {currentText.home}
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm font-medium" onClick={() => { navigate('/services'); toggleMenu(); }}>
                  {currentText.services}
                </Button>
                {user && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium" onClick={() => { navigate('/dashboard'); toggleMenu(); }}>
                    {currentText.dashboard}
                  </Button>
                )}
                {profile?.role === 'admin' && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-accent hover:text-accent/80" onClick={() => { navigate('/admin'); toggleMenu(); }}>
                    {currentText.adminPanel}
                  </Button>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="text-sm"
                  >
                    {theme === "light" ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                    {theme === "light" ? "Dark" : "Light"}
                  </Button>
                  <LanguageToggleSwitch />
                </div>
                {user && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleSignOut}>
                    {currentText.signOut}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-11"></div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        language={language}
      />
    </>
  );
};

export default Navigation;
