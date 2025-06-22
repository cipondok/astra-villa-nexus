
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Shield, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeSettings } from "@/contexts/ThemeSettingsContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggleSwitch from "@/components/ThemeToggleSwitch";
import AnimatedLogo from "@/components/AnimatedLogo";
import UserDropdownMenu from "./UserDropdownMenu";

interface EnhancedNavigationProps {
  onLoginClick?: () => void;
  language: "en" | "id";
  onLanguageToggle: () => void;
}

const EnhancedNavigation = ({ onLoginClick, language, onLanguageToggle }: EnhancedNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
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
      dashboard: "Dashboard",
      admin: "Admin",
      signIn: "Sign In",
      signOut: "Sign Out",
      language: "ID"
    },
    id: {
      home: "Beranda",
      properties: "Properti",
      about: "Tentang", 
      dashboard: "Dashboard",
      admin: "Admin",
      signIn: "Masuk",
      signOut: "Keluar",
      language: "EN"
    }
  };

  const currentText = text[language];

  const navItems = [
    { name: currentText.home, path: "/" },
    { name: currentText.properties, path: "/properties" },
    { name: currentText.about, path: "/about" },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-ios">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
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

            {/* User Dropdown Menu */}
            <UserDropdownMenu language={language} />

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
            
            {/* Mobile User Menu */}
            <div className="space-y-3 pt-4 border-t border-border/30">
              <UserDropdownMenu language={language} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default EnhancedNavigation;
