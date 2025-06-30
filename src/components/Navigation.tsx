
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
      <nav className="apple-nav">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* ASTRA Villa Logo with Apple Effects */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center transform transition-all duration-200 group-hover:scale-110 shadow-lg">
                  <Brain className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold apple-text-gradient">
                    ASTRA
                  </span>
                  <span className="text-lg font-semibold text-foreground">Villa</span>
                </div>
                <div className="text-xs text-muted-foreground font-medium">AI-Powered Platform</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="apple-nav-item"
                onClick={() => navigate('/')}
              >
                {currentText.home}
              </Button>
              <Button 
                variant="ghost" 
                className="apple-nav-item"
                onClick={() => navigate('/services')}
              >
                {currentText.services}
              </Button>
              {user && (
                <Button 
                  variant="ghost" 
                  className="apple-nav-item"
                  onClick={() => navigate('/dashboard')}
                >
                  {currentText.dashboard}
                </Button>
              )}
              {profile?.role === 'admin' && (
                <Button 
                  variant="ghost" 
                  className="text-accent hover:text-accent/80 hover:bg-accent/20 apple-nav-item"
                  onClick={() => navigate('/admin')}
                >
                  <Crown className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              )}
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-3">
              {/* Smart AI Icon */}
              <div className="relative group">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="apple-nav-item w-7 h-7 p-0 rounded-lg bg-secondary/50 hover:bg-secondary/80"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4 transition-transform group-hover:rotate-12" />
                ) : (
                  <Sun className="h-4 w-4 transition-transform group-hover:rotate-12" />
                )}
              </Button>

              <div className="hidden md:flex items-center space-x-2">
                <LanguageToggleSwitch />
              </div>

              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-foreground">
                      {profile?.full_name || currentText.user}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {profile?.role || 'user'}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="apple-button-primary text-sm px-4 py-2"
                >
                  {currentText.signIn}
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden apple-nav-item w-7 h-7 p-0"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-border apple-glass mt-2 rounded-2xl">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md apple-nav-item" onClick={() => { navigate('/'); toggleMenu(); }}>
                  {currentText.home}
                </Button>
                <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md apple-nav-item" onClick={() => { navigate('/services'); toggleMenu(); }}>
                  {currentText.services}
                </Button>
                {user && (
                  <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md apple-nav-item" onClick={() => { navigate('/dashboard'); toggleMenu(); }}>
                    {currentText.dashboard}
                  </Button>
                )}
                {profile?.role === 'admin' && (
                  <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md text-accent hover:text-accent/80 hover:bg-accent/20" onClick={() => { navigate('/admin'); toggleMenu(); }}>
                    {currentText.adminPanel}
                  </Button>
                )}
                <div className="flex items-center justify-between px-3 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="apple-nav-item"
                  >
                    {theme === "light" ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                    {theme === "light" ? "Dark" : "Light"}
                  </Button>
                  <LanguageToggleSwitch />
                </div>
                {user && (
                  <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
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
