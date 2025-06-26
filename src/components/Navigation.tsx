import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Settings, LogOut, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggleSwitch from "./LanguageToggleSwitch";
import ThemeToggleBar from "./ThemeToggleBar";
import AuthModal from "./AuthModal";
import { useNavigate, useLocation } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-white">ASTRA Villa</span>
                <div className="text-xs text-purple-300">Luxury Property Platform</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white hover:bg-purple-600/20"
                onClick={() => navigate('/')}
              >
                {currentText.home}
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white hover:bg-purple-600/20"
                onClick={() => navigate('/services')}
              >
                {currentText.services}
              </Button>
              {user && (
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-white hover:bg-purple-600/20"
                  onClick={() => navigate('/dashboard')}
                >
                  {currentText.dashboard}
                </Button>
              )}
              {profile?.role === 'admin' && (
                <Button 
                  variant="ghost" 
                  className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-600/20"
                  onClick={() => navigate('/admin')}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              )}
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <ThemeToggleBar language={language} />
                <LanguageToggleSwitch />
              </div>

              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-white">
                      {profile?.full_name || currentText.user}
                    </div>
                    <div className="text-xs text-purple-300 capitalize">
                      {profile?.role || 'user'}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-300 hover:text-white hover:bg-red-600/20"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {currentText.signIn}
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-300 hover:text-white"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-purple-600/20" onClick={() => { navigate('/'); toggleMenu(); }}>
                  {currentText.home}
                </Button>
                <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-purple-600/20" onClick={() => { navigate('/services'); toggleMenu(); }}>
                  {currentText.services}
                </Button>
                {user && (
                  <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-purple-600/20" onClick={() => { navigate('/dashboard'); toggleMenu(); }}>
                    {currentText.dashboard}
                  </Button>
                )}
                {profile?.role === 'admin' && (
                  <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md text-yellow-400 hover:text-yellow-300 hover:bg-yellow-600/20" onClick={() => { navigate('/admin'); toggleMenu(); }}>
                    {currentText.adminPanel}
                  </Button>
                )}
                {user && (
                  <Button variant="ghost" className="block w-full text-left px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-red-600/20" onClick={handleSignOut}>
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
