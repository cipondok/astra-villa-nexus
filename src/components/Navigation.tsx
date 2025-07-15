
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Settings, LogOut, Crown, Moon, Sun, Sparkles, Brain, Home as HomeIcon, Building, Key, Rocket, Hammer, BarChart3, Headphones, Box, Settings2 } from "lucide-react";
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

  // Handle scroll effect with throttling for better performance
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 0;
          setScrolled(isScrolled);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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
      buyProperties: "Dijual",
      rentProperties: "Disewa",
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
      path: '/dijual',
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      icon: Key, 
      label: currentText.rentProperties, 
      path: '/disewa',
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
    },
    { 
      icon: Box, 
      label: '3D Showcase', 
      path: '/3d-showcase',
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  // Check if user is admin or agent
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';
  const isAgent = profile?.role === 'agent';

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-[10000] header-ios border-b border-white/10 backdrop-blur-xl shadow-lg transform-gpu will-change-transform">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* ASTRA Villa Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white dark:text-white light:text-gray-900" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xl font-bold text-gray-900 dark:text-white drop-shadow-lg">ASTRA</span>
                <span className="text-xl font-bold text-gray-800 dark:text-white/90 drop-shadow-lg">Villa</span>
              </div>
            </div>

            {/* Desktop Navigation - Main Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-10 px-3 text-sm font-medium text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 rounded-lg transition-all"
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
                    className={`h-10 px-3 text-sm font-medium hover:bg-white/10 rounded-lg transition-all text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white`}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-4 w-4" />
                  </Button>
                  {/* Tooltip - Positioned Below */}
                   <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                     {item.label}
                     <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/90"></div>
                  </div>
                </div>
              ))}

              <Button 
                variant="ghost" 
                size="sm"
                className="h-10 px-3 text-sm font-medium text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 rounded-lg transition-all"
                onClick={() => navigate('/services')}
              >
                <Settings2 className="h-4 w-4 mr-2" />
                {currentText.services}
              </Button>

              {/* Dashboard link - show role-appropriate dashboard */}
              {user && !isAdmin && !isAgent && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                  onClick={() => navigate('/dashboard/user')}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  {currentText.dashboard}
                </Button>
              )}

              {/* Agent Dashboard - only show for agent users */}
              {isAgent && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 px-3 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                  onClick={() => navigate('/agent')}
                >
                  <User className="h-4 w-4 mr-1" />
                  Agent Dashboard
                </Button>
              )}

              {/* Vendor Dashboard - only show for vendor users */}
              {profile?.role === 'vendor' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 px-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                  onClick={() => navigate('/vendor')}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Vendor Dashboard
                </Button>
              )}

              {/* Admin Panel - only show for admin users */}
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 px-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                  onClick={() => navigate('/admin-dashboard')}
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
                className="w-10 h-10 p-0 rounded-lg bg-white/20 hover:bg-white/30 transition-all border border-white/30 text-gray-900 dark:text-white"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>

              {/* Language Toggle - Hidden on mobile */}
              <div className="hidden md:block">
                <LanguageToggleSwitch />
              </div>

              {/* User Section - Modern AI Style */}
              {user ? (
                <div className="flex items-center space-x-1">
                  {/* Modern AI User Avatar */}
                  <div className="relative group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    {/* User tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                      {profile?.full_name || user.email}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-100"></div>
                    </div>
                  </div>
                  
                  {/* Modern AI Logout Button */}
                  <div className="relative group">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleSignOut}
                      className="w-8 h-8 p-0 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-300 hover:scale-110"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                    {/* Logout tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                      {currentText.signOut}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-100"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 p-0 rounded-lg bg-white/20 hover:bg-white/30 transition-all border border-white/30 text-gray-900 dark:text-white"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  {/* User login tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                    {currentText.signIn}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/90"></div>
                  </div>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden w-10 h-10 p-0 rounded-lg bg-white/20 hover:bg-white/30 transition-all border border-white/30 text-gray-900 dark:text-white"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation - Slim with 50% transparency */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full right-0 w-64 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-b border-l border-gray-200/50 dark:border-gray-800/50 shadow-lg z-[9999] transform-gpu will-change-transform rounded-bl-lg">
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
                  <Settings2 className="h-4 w-4 mr-2" />
                  {currentText.services}
                </Button>
                
                {/* Dashboard link - show for authenticated users */}
                {user && !isAdmin && !isAgent && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { navigate('/dashboard/user'); toggleMenu(); }}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {currentText.dashboard}
                  </Button>
                )}

                {/* Agent Dashboard for mobile */}
                {isAgent && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => { navigate('/agent'); toggleMenu(); }}>
                    <User className="h-4 w-4 mr-2" />
                    Agent Dashboard
                  </Button>
                )}

                {/* Vendor Dashboard for mobile */}
                {profile?.role === 'vendor' && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20" onClick={() => { navigate('/vendor'); toggleMenu(); }}>
                    <Settings className="h-4 w-4 mr-2" />
                    Vendor Dashboard
                  </Button>
                )}
                
                {/* Admin Panel - only show for admin users */}
                {isAdmin && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => { navigate('/admin-dashboard'); toggleMenu(); }}>
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
