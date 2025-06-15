import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Globe, Bot, Plus, Home, Building, Info, ShoppingCart, KeyRound, Construction, Rocket, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeSettings } from "@/contexts/ThemeSettingsContext";
import { useTheme } from "@/components/ThemeProvider";
import RoleBasedAuthModal from "./RoleBasedAuthModal";
import ThemeToggleSwitch from "./ThemeToggleSwitch";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [language, setLanguage] = useState<"en" | "id">("en");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { themeSettings } = useThemeSettings();

  const navItems = [
    { name: "Home", path: "/", icon: Home, isImplemented: true },
    { name: "Properties", path: "/properties", icon: Building, isImplemented: true },
    { name: "Buy", path: "/buy", icon: ShoppingCart, isImplemented: true },
    { name: "Rent", path: "/rent", icon: KeyRound, isImplemented: true },
    { name: "New Projects", path: "/new-projects", icon: Construction, isImplemented: true },
    { name: "Pre-launching", path: "/pre-launching", icon: Rocket, isImplemented: true },
    { name: "About", path: "/about", icon: Info, isImplemented: true },
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
    setLanguage(prev => prev === "en" ? "id" : "en");
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
                      className="flex items-center justify-center p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="sr-only">Add Property</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add Property</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Right side controls - Icon only */}
              <div className="hidden md:flex items-center space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleLanguage}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary-dynamic hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transform hover:scale-110 transition-transform"
                    >
                      <Globe className="h-5 w-5" />
                      <span className="sr-only">Toggle Language ({language.toUpperCase()})</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Switch to {language === 'en' ? 'Indonesian' : 'English'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="transform hover:scale-110 transition-transform rounded-full">
                      <ThemeToggleSwitch language={language} showLabel={false} className="bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle Theme</p>
                  </TooltipContent>
                </Tooltip>
                
                {user ? (
                  <div className="flex items-center space-x-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/dashboard"
                          className="flex items-center p-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-dynamic hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 rounded-xl transform hover:scale-110"
                        >
                          <User className="w-5 h-5" />
                          <span className="sr-only">Dashboard</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent><p>Dashboard</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleSignOut}
                          variant="ghost"
                          size="icon"
                          className="text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transform hover:scale-110 transition-transform"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="sr-only">Sign Out</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Sign Out</p></TooltipContent>
                    </Tooltip>
                  </div>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Button
                        onClick={() => setShowAuthModal(true)}
                        size="icon"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl p-2.5 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                      >
                        <LogIn className="w-5 h-5" />
                        <span className="sr-only">Sign In</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Sign In</p></TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center space-x-2">
                {/* Mobile Theme Toggle - Compact */}
                <div className="bg-transparent">
                  <ThemeToggleSwitch language={language} className="scale-90 bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" />
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-dynamic hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl p-2"
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation - iPhone style */}
          {isOpen && (
            <div className="md:hidden glass-card-dark border-t border-white/10 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90">
              <div className="px-3 pt-2 pb-3 space-y-1">
                {navItems.map((item) =>
                  item.isImplemented ? (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 text-base font-medium transition-all duration-300 rounded-xl ${
                        location.pathname === item.path
                          ? "text-primary-dynamic bg-primary-dynamic/10 border border-primary-dynamic/20"
                          : "text-gray-600 dark:text-gray-300 hover:text-primary-dynamic hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ) : (
                    <button
                      key={item.name}
                      onClick={() => handleComingSoon(item.name)}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-dynamic hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 rounded-xl w-full"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </button>
                  )
                )}
                
                {/* Mobile Add Property Button - Always visible */}
                <button
                  onClick={handleAddPropertyClick}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 rounded-xl shadow-lg w-full"
                >
                  <Plus className="h-5 w-5" />
                  Add Property
                </button>
                
                {/* Mobile Language Toggle */}
                <Button
                  variant="ghost"
                  onClick={toggleLanguage}
                  className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-primary-dynamic hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl px-4 py-3"
                >
                  <Globe className="h-5 w-5 mr-3" />
                  Language: {language.toUpperCase()}
                </Button>
                
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-dynamic hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 rounded-xl"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 rounded-xl"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl py-3 shadow-lg"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          )}
        </nav>

        <RoleBasedAuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </TooltipProvider>
    </>
  );
};

export default Navigation;
