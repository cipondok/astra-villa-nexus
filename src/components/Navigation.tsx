
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Globe, Bot, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeSettings } from "@/contexts/ThemeSettingsContext";
import { useTheme } from "@/components/ThemeProvider";
import RoleBasedAuthModal from "./RoleBasedAuthModal";
import ThemeToggleSwitch from "./ThemeToggleSwitch";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [language, setLanguage] = useState<"en" | "id">("en");
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { themeSettings } = useThemeSettings();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Properties", path: "/properties" },
    { name: "About", path: "/about" },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "id" : "en");
  };

  return (
    <>
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Bot className="w-6 h-6 text-primary-dynamic animate-pulse" />
                    <div className="absolute inset-0 w-6 h-6 bg-primary-dynamic/20 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-2xl font-bold">
                    <span className="inline-block animate-gradient bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent bg-[length:300%_300%] hover:scale-105 transition-transform duration-300 group-hover:from-purple-400 group-hover:via-blue-400 group-hover:to-orange-400">
                      Astra Villa
                    </span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "text-primary-dynamic border-b-2 border-primary-dynamic"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Add Property Button - Only show if user is logged in */}
              {user && (
                <Link
                  to="/add-property"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-dynamic text-white rounded-lg hover:bg-primary-dynamic/80 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Property
                </Link>
              )}
            </div>

            {/* Right side controls */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </Button>

              {/* Theme Toggle Switch - Made Transparent */}
              <div className="bg-transparent">
                <ThemeToggleSwitch language={language} className="bg-transparent border-transparent hover:bg-white/5" />
              </div>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-primary-dynamic hover:bg-primary-dynamic text-white"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Theme Toggle - Made Transparent */}
              <div className="bg-transparent">
                <ThemeToggleSwitch language={language} className="scale-90 bg-transparent border-transparent hover:bg-white/5" />
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden glass-card-dark border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? "text-primary-dynamic bg-white/10"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Add Property Link */}
              {user && (
                <Link
                  to="/add-property"
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Plus className="h-4 w-4" />
                  Add Property
                </Link>
              )}
              
              {/* Mobile Language Toggle */}
              <Button
                variant="ghost"
                onClick={toggleLanguage}
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
              >
                <Globe className="h-4 w-4 mr-2" />
                Language: {language.toUpperCase()}
              </Button>
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setShowAuthModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full mt-2 bg-primary-dynamic hover:bg-primary-dynamic text-white"
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
