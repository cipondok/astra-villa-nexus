
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Settings, LogOut, Crown, Moon, Sun, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import LanguageToggleSwitch from "./LanguageToggleSwitch";
import AuthModal from "./AuthModal";
import { useNavigate, useLocation } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

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
      <nav className="wwdc-nav">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* ASTRA Villa Logo with AI Effects */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Sparkles className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-all duration-300 animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    ASTRA
                  </span>
                  <span className="text-xl font-bold text-foreground">Villa</span>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                </div>
                <div className="text-xs text-muted-foreground">AI-Powered Property Platform</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <Button 
                variant="ghost" 
                className="wwdc-nav-item"
                onClick={() => navigate('/')}
              >
                {currentText.home}
              </Button>
              <Button 
                variant="ghost" 
                className="wwdc-nav-item"
                onClick={() => navigate('/services')}
              >
                {currentText.services}
              </Button>
              {user && (
                <Button 
                  variant="ghost" 
                  className="wwdc-nav-item"
                  onClick={() => navigate('/dashboard')}
                >
                  {currentText.dashboard}
                </Button>
              )}
              {profile?.role === 'admin' && (
                <Button 
                  variant="ghost" 
                  className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-600/20 wwdc-nav-item"
                  onClick={() => navigate('/admin')}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              )}
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="wwdc-nav-item relative group"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5 transition-transform group-hover:rotate-12" />
                ) : (
                  <Sun className="h-5 w-5 transition-transform group-hover:rotate-12" />
                )}
              </Button>

              <div className="hidden md:flex items-center space-x-3">
                <LanguageToggleSwitch />
              </div>

              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-foreground">
                      {profile?.full_name || currentText.user}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {profile?.role || 'user'}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="wwdc-button-primary"
                >
                  {currentText.signIn}
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden wwdc-nav-item"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-border wwdc-glass mt-2 rounded-2xl">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md wwdc-nav-item" onClick={() => { navigate('/'); toggleMenu(); }}>
                  {currentText.home}
                </Button>
                <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md wwdc-nav-item" onClick={() => { navigate('/services'); toggleMenu(); }}>
                  {currentText.services}
                </Button>
                {user && (
                  <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md wwdc-nav-item" onClick={() => { navigate('/dashboard'); toggleMenu(); }}>
                    {currentText.dashboard}
                  </Button>
                )}
                {profile?.role === 'admin' && (
                  <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md text-yellow-400 hover:text-yellow-300 hover:bg-yellow-600/20" onClick={() => { navigate('/admin'); toggleMenu(); }}>
                    {currentText.adminPanel}
                  </Button>
                )}
                <div className="flex items-center justify-between px-3 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="wwdc-nav-item"
                  >
                    {theme === "light" ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                    {theme === "light" ? "Dark" : "Light"}
                  </Button>
                  <LanguageToggleSwitch />
                </div>
                {user && (
                  <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md text-red-500 hover:bg-red-500/10" onClick={handleSignOut}>
                    {currentText.signOut}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

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
