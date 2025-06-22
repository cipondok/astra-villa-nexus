
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Globe, Bot, Plus, Home, Building, Info, ShoppingCart, KeyRound, Construction, Rocket, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeSettings } from "@/contexts/ThemeSettingsContext";
import { useTheme } from "@/components/ThemeProvider";
import RoleBasedAuthModal from "./RoleBasedAuthModal";
import ThemeToggleSwitch from "./ThemeToggleSwitch";
import LanguageToggleSwitch from "./LanguageToggleSwitch";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, profile } = useAuth();
  const { themeSettings } = useThemeSettings();
  const { language, setLanguage } = useLanguage();

  // Check if user is admin
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

  const labels = {
    en: {
      Home: "Home",
      Properties: "Properties",
      Buy: "Buy",
      Rent: "Rent",
      "New Projects": "New Projects",
      "Pre-launching": "Pre-launching",
      About: "About",
      "Add Property": "Add Property",
      "Switch Language": "Switch to Indonesian",
      "Sign In": "Sign In",
      "Sign Out": "Sign Out",
      Dashboard: "Dashboard",
      "Admin Panel": "Admin Panel"
    },
    id: {
      Home: "Beranda",
      Properties: "Properti",
      Buy: "Beli",
      Rent: "Sewa",
      "New Projects": "Proyek Baru",
      "Pre-launching": "Pra-luncur",
      About: "Tentang",
      "Add Property": "Tambah Properti",
      "Switch Language": "Ganti ke Inggris",
      "Sign In": "Masuk",
      "Sign Out": "Keluar",
      Dashboard: "Dashboard",
      "Admin Panel": "Panel Admin"
    }
  };

  const navLabels = labels[language];

  const navItems = [
    { name: navLabels.Home, path: "/", icon: Home, isImplemented: true },
    { name: navLabels.Properties, path: "/properties", icon: Building, isImplemented: true },
    { name: navLabels.Buy, path: "/buy", icon: ShoppingCart, isImplemented: true },
    { name: navLabels.Rent, path: "/rent", icon: KeyRound, isImplemented: true },
    { name: navLabels["New Projects"], path: "/new-projects", icon: Construction, isImplemented: true },
    { name: navLabels["Pre-launching"], path: "/pre-launching", icon: Rocket, isImplemented: true },
    { name: navLabels.About, path: "/about", icon: Info, isImplemented: true },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleComingSoon = (featureName: string) => {
    toast.info(`${featureName} page is coming soon. Stay tuned!`);
    setIsOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en");
  };

  const handleAddPropertyClick = () => {
    if (user) {
      navigate('/add-property');
    } else {
      setShowAuthModal(true);
    }
    setIsOpen(false);
  };

  return (
    <>
      <TooltipProvider delayDuration={100}>
        <nav className="nav-ios sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <div className="flex justify-between h-14">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex-shrink-0 flex items-center group">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Rocket className="w-6 h-6 text-primary-dynamic animate-pulse" />
                      <div className="absolute inset-0 w-6 h-6 bg-primary-dynamic/20 rounded-full animate-ping delay-500"></div>
                    </div>
                    <span className="text-lg font-bold">
                      <span className="inline-block animate-gradient bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent bg-[length:300%_300%] hover:scale-105 transition-transform duration-300 group-hover:from-purple-400 group-hover:via-blue-400 group-hover:to-orange-400">
                        Astra Villa
                      </span>
                    </span>
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation - Icon only */}
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      {item.isImplemented ? (
                        <Link
                          to={item.path}
                          className={`flex items-center justify-center p-2 text-sm font-medium transition-all duration-300 rounded-xl transform hover:scale-110 ${
                            location.pathname === item.path
                              ? "text-primary-dynamic bg-primary-dynamic/10"
                              : "text-gray-600 dark:text-gray-300 hover:text-primary-dynamic hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="sr-only">{item.name}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleComingSoon(item.name)}
                          className="flex items-center justify-center p-2 text-sm font-medium transition-all duration-300 rounded-xl text-gray-600 dark:text-gray-300 hover:text-primary-dynamic hover:bg-gray-100 dark:hover:bg-gray-800 transform hover:scale-110"
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="sr-only">{item.name}</span>
                        </button>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleAddPropertyClick}
                      className="flex items-center justify-center p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-110"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="sr-only">{navLabels["Add Property"]}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{navLabels["Add Property"]}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Right Side Controls */}
              <div className="flex items-center space-x-2">
                {/* Theme Toggle */}
                <ThemeToggleSwitch language={language} />
                
                {/* Language Toggle */}
                <LanguageToggleSwitch language={language} onToggle={toggleLanguage} />

                {/* Authentication Section */}
                {user ? (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => navigate('/dashboard')}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{navLabels.Dashboard}</p>
                      </TooltipContent>
                    </Tooltip>

                    {isAdmin && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => navigate('/admin')}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                          >
                            <Bot className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{navLabels["Admin Panel"]}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleSignOut}
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{navLabels["Sign Out"]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                        size="sm"
                      >
                        <LogIn className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">{navLabels["Sign In"]}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{navLabels["Sign In"]}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-dynamic"
                  >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden dropdown-ios border-t border-border/30 mt-2 mx-4 mb-4">
              <div className="p-6 space-y-4">
                {navItems.map((item) => (
                  item.isImplemented ? (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="flex items-center space-x-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ) : (
                    <button
                      key={item.name}
                      onClick={() => handleComingSoon(item.name)}
                      className="flex items-center space-x-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 w-full text-left"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </button>
                  )
                ))}
                
                <button
                  onClick={handleAddPropertyClick}
                  className="flex items-center space-x-3 text-base font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 w-full text-left"
                >
                  <Plus className="h-5 w-5" />
                  <span>{navLabels["Add Property"]}</span>
                </button>
                
                {user ? (
                  <div className="space-y-3 pt-4 border-t border-border/30">
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-3 text-base font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 w-full text-left"
                    >
                      <User className="h-5 w-5" />
                      <span>{navLabels.Dashboard}</span>
                    </button>
                    
                    {isAdmin && (
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setIsOpen(false);
                        }}
                        className="flex items-center space-x-3 text-base font-medium text-red-600 hover:text-red-700 transition-colors duration-200 w-full text-left"
                      >
                        <Bot className="h-5 w-5" />
                        <span>{navLabels["Admin Panel"]}</span>
                      </button>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 text-base font-medium text-red-600 hover:text-red-700 transition-colors duration-200 w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{navLabels["Sign Out"]}</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-border/30">
                    <Button
                      onClick={() => {
                        setShowAuthModal(true);
                        setIsOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {navLabels["Sign In"]}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </TooltipProvider>

      {/* Auth Modal */}
      <RoleBasedAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        language={language}
      />
    </>
  );
};

export default Navigation;
