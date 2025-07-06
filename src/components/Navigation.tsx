
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Settings, LogOut, Crown, Moon, Sun, Sparkles, Brain, Home as HomeIcon, Building, Key, Rocket, Hammer, BarChart3, Headphones } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import LanguageToggleSwitch from "./LanguageToggleSwitch";
import EnhancedAuthModal from "./auth/EnhancedAuthModal";
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
      admin: "Admin",
      signIn: "Sign In",
      signOut: "Sign Out",
      user: "User",
      adminPanel: "Admin Panel",
      settings: "Settings",
      properties: "Properties",
      saved: "Saved",
      messages: "Messages",
      buyProperties: "Buy Properties",
      rentProperties: "Rent Properties",
      preLaunch: "Pre Launch",
      newProjects: "New Projects",
      profile: "Profile",
      dashboard: "Dashboard",
      csDashboard: "CS Dashboard"
    },
    id: {
      home: "Beranda",
      services: "Layanan",
      admin: "Admin",
      signIn: "Masuk",
      signOut: "Keluar",
      user: "Pengguna",
      adminPanel: "Panel Admin",
      settings: "Pengaturan",
      properties: "Properti",
      saved: "Disimpan",
      messages: "Pesan",
      buyProperties: "Beli Properti",
      rentProperties: "Sewa Properti",
      preLaunch: "Pra Peluncuran",
      newProjects: "Proyek Baru",
      profile: "Profil",
      dashboard: "Dashboard",
      csDashboard: "Dashboard CS"
    }
  };

  const currentText = text[language] || text.en;

  // Property navigation items
  const propertyNavItems = [
    { 
      icon: Building, 
      label: currentText.buyProperties, 
      path: '/buy',
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      icon: Key, 
      label: currentText.rentProperties, 
      path: '/rent',
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      icon: Rocket, 
      label: currentText.preLaunch, 
      path: '/pre-launching',
      color: 'text-purple-600 dark:text-purple-400'
    },
    { 
      icon: Hammer, 
      label: currentText.newProjects, 
      path: '/new-projects',
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  // Check if user is admin
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        scrolled 
          ? 'bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm' 
          : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ASTRA Villa Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-700 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">ASTRA</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Villa</span>
              </div>
            </div>

            {/* Desktop Navigation - Main Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-10 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                onClick={() => navigate('/')}
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                {currentText.home}
              </Button>

              {/* Property Navigation Items with Tooltips - Positioned Below */}
              {propertyNavItems.map((item) => (
                <div key={item.path} className="relative group">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`h-10 px-3 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all ${item.color}`}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-4 w-4" />
                  </Button>
                  {/* Tooltip - Positioned Below */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                    {item.label}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-100"></div>
                  </div>
                </div>
              ))}

              <Button 
                variant="ghost" 
                size="sm"
                className="h-10 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                onClick={() => navigate('/services')}
              >
                {currentText.services}
              </Button>

              {/* Dashboard/Profile links - show for authenticated users */}
              {user && !isAdmin && (
                <>
                  {profile?.role === 'customer_service' ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-10 px-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      onClick={() => navigate('/dashboard')}
                    >
                      <Headphones className="h-4 w-4 mr-1" />
                      {currentText.csDashboard}
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-10 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                      onClick={() => navigate('/user-dashboard')}
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      {currentText.dashboard}
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-10 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="h-4 w-4 mr-1" />
                    {currentText.profile}
                  </Button>
                </>
              )}

              {/* Admin Panel - only show for admin users */}
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 px-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                  onClick={() => navigate('/admin')}
                >
                  <Crown className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              )}
            </div>

            {/* Right Section - Compact Controls */}
            <div className="flex items-center space-x-2">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-10 h-10 p-0 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                )}
              </Button>

              {/* Language Toggle - Hidden on mobile */}
              <div className="hidden md:block">
                <LanguageToggleSwitch />
              </div>

              {/* User Section */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center border border-blue-300 dark:border-blue-500">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSignOut}
                    className="w-10 h-10 p-0 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  size="sm"
                  className="h-10 px-4 text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-all border border-blue-700 dark:border-blue-500"
                >
                  {currentText.signIn}
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden w-10 h-10 p-0 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation - Slide down */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg z-[9998]">
              <div className="px-4 py-3 space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { navigate('/'); toggleMenu(); }}>
                  <HomeIcon className="h-4 w-4 mr-2" />
                  {currentText.home}
                </Button>

                {/* Mobile Property Navigation */}
                {propertyNavItems.map((item) => (
                  <Button 
                    key={item.path}
                    variant="ghost" 
                    className={`w-full justify-start text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${item.color}`} 
                    onClick={() => { navigate(item.path); toggleMenu(); }}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}

                <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { navigate('/services'); toggleMenu(); }}>
                  {currentText.services}
                </Button>
                
                {/* Dashboard/Profile links - show for authenticated users */}
                {user && !isAdmin && (
                  <>
                    {profile?.role === 'customer_service' ? (
                      <Button variant="ghost" className="w-full justify-start text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => { navigate('/dashboard'); toggleMenu(); }}>
                        <Headphones className="h-4 w-4 mr-2" />
                        {currentText.csDashboard}
                      </Button>
                    ) : (
                      <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { navigate('/user-dashboard'); toggleMenu(); }}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {currentText.dashboard}
                      </Button>
                    )}
                    <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { navigate('/profile'); toggleMenu(); }}>
                      <User className="h-4 w-4 mr-2" />
                      {currentText.profile}
                    </Button>
                  </>
                )}
                
                {/* Admin Panel - only show for admin users */}
                {isAdmin && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => { navigate('/admin'); toggleMenu(); }}>
                    {currentText.adminPanel}
                  </Button>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {theme === "light" ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                    {theme === "light" ? "Dark" : "Light"}
                  </Button>
                  <LanguageToggleSwitch />
                </div>
                {user && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleSignOut}>
                    {currentText.signOut}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16"></div>

      {/* Enhanced Auth Modal */}
      <EnhancedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        language={language}
      />
    </>
  );
};

export default Navigation;
