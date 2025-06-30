
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
          ? 'bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm' 
          : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            {/* ASTRA Villa Logo - Fixed, No Animation */}
            <div 
              className="flex items-center space-x-2 cursor-pointer group" 
              onClick={() => navigate('/')}
            >
              <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center">
                <Brain className="h-3 w-3 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">ASTRA</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">Villa</span>
              </div>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 px-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                onClick={() => navigate('/')}
              >
                {currentText.home}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 px-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                onClick={() => navigate('/services')}
              >
                {currentText.services}
              </Button>
              {user && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                  onClick={() => navigate('/dashboard')}
                >
                  {currentText.dashboard}
                </Button>
              )}
              {profile?.role === 'admin' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                  onClick={() => navigate('/admin')}
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </Button>
              )}
            </div>

            {/* Right Section - Compact Controls */}
            <div className="flex items-center space-x-1">
              {/* Smart AI Icon - Smaller */}
              <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 backdrop-blur-sm border border-blue-200 dark:border-blue-700 flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Dark Mode Toggle - Compact */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-5 h-5 p-0 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
              >
                {theme === "light" ? (
                  <Moon className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                )}
              </Button>

              {/* Language Toggle - Hidden on mobile */}
              <div className="hidden md:block">
                <LanguageToggleSwitch />
              </div>

              {/* User Section - Compact */}
              {user ? (
                <div className="flex items-center space-x-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center border border-blue-300 dark:border-blue-500">
                    <User className="h-2.5 w-2.5 text-white" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSignOut}
                    className="w-5 h-5 p-0 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <LogOut className="h-2.5 w-2.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  size="sm"
                  className="h-7 px-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-all border border-blue-700 dark:border-blue-500"
                >
                  {currentText.signIn}
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden w-5 h-5 p-0 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-3 w-3" /> : <Menu className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation - Slide down */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <div className="px-4 py-2 space-y-1">
                <Button variant="ghost" className="w-full justify-start text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { navigate('/'); toggleMenu(); }}>
                  {currentText.home}
                </Button>
                <Button variant="ghost" className="w-full justify-start text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { navigate('/services'); toggleMenu(); }}>
                  {currentText.services}
                </Button>
                {user && (
                  <Button variant="ghost" className="w-full justify-start text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { navigate('/dashboard'); toggleMenu(); }}>
                    {currentText.dashboard}
                  </Button>
                )}
                {profile?.role === 'admin' && (
                  <Button variant="ghost" className="w-full justify-start text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => { navigate('/admin'); toggleMenu(); }}>
                    {currentText.adminPanel}
                  </Button>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {theme === "light" ? <Moon className="h-3 w-3 mr-1" /> : <Sun className="h-3 w-3 mr-1" />}
                    {theme === "light" ? "Dark" : "Light"}
                  </Button>
                  <LanguageToggleSwitch />
                </div>
                {user && (
                  <Button variant="ghost" className="w-full justify-start text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleSignOut}>
                    {currentText.signOut}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-10"></div>

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
