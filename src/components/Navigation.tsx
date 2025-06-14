
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Globe, Bot, Plus, Home, Building, Info, ShoppingCart, KeyRound, Construction, Rocket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeSettings } from "@/contexts/ThemeSettingsContext";
import { useTheme } from "@/components/ThemeProvider";
import RoleBasedAuthModal from "./RoleBasedAuthModal";
import ThemeToggleSwitch from "./ThemeToggleSwitch";
import { toast } from "sonner";

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
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Bot className="w-5 h-5 text-primary-dynamic animate-pulse" />
                    <div className="absolute inset-0 w-5 h-5 bg-primary-dynamic/20 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-lg font-bold">
                    <span className="inline-block animate-gradient bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent bg-[length:300%_300%] hover:scale-105 transition-transform duration-300 group-hover:from-purple-400 group-hover:via-blue-400 group-hover:to-orange-400">
                      Astra Villa
                    </span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - More compact */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) =>
                item.isImplemented ? (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-xl ${
                      location.pathname === item.path
                        ? "text-primary-dynamic bg-primary-dynamic/10 border border-primary-dynamic/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-primary-dynamic hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                ) : (
                  <button
                    key={item.name}
                    onClick={() => handleComingSoon(item.name)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-xl text-gray-600 dark:text-gray-300 hover:text-primary-dynamic hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </button>
                )
              )}
              
              {/* Add Property Button - Always visible */}
              <button
                onClick={handleAddPropertyClick}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline">Add Property</span>
              </button>
            </div>

            {/* Right side controls - More compact */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Language Toggle - iPhone style */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="text-gray-600 dark:text-gray-300 hover:text-primary-dynamic hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1 rounded-xl px-3 py-2"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </Button>

              {/* Theme Toggle Switch - More compact */}
              <div className="bg-transparent">
                <ThemeToggleSwitch language={language} className="bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" />
              </div>
              
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-dynamic hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 rounded-xl"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Dashboard</span>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl px-3 py-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline ml-1">Sign Out</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-4 py-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile menu button - iPhone style */}
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
    </>
  );
};

export default Navigation;
