
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Shield, Settings, Headphones } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeSettings } from "@/contexts/ThemeSettingsContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggleSwitch from "@/components/ThemeToggleSwitch";
import AnimatedLogo from "@/components/AnimatedLogo";

interface EnhancedNavigationProps {
  onLoginClick?: () => void;
  language: "en" | "id";
  onLanguageToggle: () => void;
}

const EnhancedNavigation = ({ onLoginClick, language, onLanguageToggle }: EnhancedNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, profile } = useAuth();
  const { themeSettings } = useThemeSettings();
  const navigate = useNavigate();

  const { data: adminData } = useQuery({
    queryKey: ['admin-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  const text = {
    en: {
      home: "Home",
      properties: "Properties", 
      about: "About",
      admin: "Admin",
      signIn: "Sign In",
      signOut: "Sign Out",
      language: "ID"
    },
    id: {
      home: "Beranda",
      properties: "Properti",
      about: "Tentang", 
      admin: "Admin",
      signIn: "Masuk",
      signOut: "Keluar",
      language: "EN"
    }
  };

  const currentText = text[language];

  const navItems = [
    { name: currentText.home, path: "/" },
    { name: currentText.about, path: "/about" },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-ios">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 xl:px-16">
        <div className="flex justify-between items-center h-20">
          {/* Animated Logo */}
          <Link to="/">
            <AnimatedLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggleSwitch language={language} />

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLanguageToggle}
              className="text-muted-foreground hover:text-foreground border border-border/30 hover:bg-foreground/10 transition-all duration-200"
            >
              {currentText.language}
            </Button>

            {/* User Actions */}
            {user ? (
              <div className="flex items-center space-x-3">
                {adminData && (
                  <Button
                    onClick={handleAdminClick}
                    variant="ghost"
                    size="sm"
                    className="bg-ios-red/10 hover:bg-ios-red/20 text-ios-red hover:text-ios-red border-ios-red/30 hover:border-ios-red/50 transition-all duration-300"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{currentText.admin}</span>
                  </Button>
                )}
                
                {profile?.role === 'customer_service' && (
                  <Button
                    onClick={() => navigate('/dashboard/customer-service')}
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 shadow-sm"
                  >
                    <Headphones className="h-4 w-4 mr-2" />
                    CS Dashboard
                  </Button>
                )}
                
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground border border-border/30 hover:bg-foreground/10 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{currentText.signOut}</span>
                </Button>
              </div>
            ) : (
              onLoginClick && (
                <Button
                  onClick={onLoginClick}
                  className="btn-primary-ios px-6 py-2"
                >
                  {currentText.signIn}
                </Button>
              )
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="text-muted-foreground hover:text-foreground border border-border/30 hover:bg-foreground/10"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden dropdown-ios border-t border-border/30 mt-2 mx-4 mb-4">
          <div className="p-6 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="block text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <div className="space-y-3 pt-4 border-t border-border/30">
                {adminData && (
                  <Button
                    onClick={handleAdminClick}
                    variant="ghost"
                    className="w-full justify-start bg-ios-red/10 hover:bg-ios-red/20 text-ios-red"
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    {currentText.admin}
                  </Button>
                )}
                
                {profile?.role === 'customer_service' && (
                  <Button
                    onClick={() => {
                      navigate('/dashboard/customer-service');
                      setIsOpen(false);
                    }}
                    variant="default"
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <Headphones className="h-4 w-4 mr-3" />
                    CS Dashboard
                  </Button>
                )}
                
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  {currentText.signOut}
                </Button>
              </div>
            ) : (
              onLoginClick && (
                <div className="pt-4 border-t border-border/30">
                  <Button
                    onClick={() => {
                      onLoginClick();
                      setIsOpen(false);
                    }}
                    className="w-full btn-primary-ios"
                  >
                    {currentText.signIn}
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default EnhancedNavigation;
