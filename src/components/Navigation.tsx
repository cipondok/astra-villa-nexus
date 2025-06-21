
import { useState } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import RoleBasedNavigation from "@/components/RoleBasedNavigation";
import SimpleAuthModal from "@/components/auth/SimpleAuthModal";

const Navigation = () => {
  const { theme, setTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleLoginClick = () => {
    console.log('Opening auth modal from navigation');
    setAuthModalOpen(true);
  };

  const handleLanguageToggle = () => {
    toggleLanguage();
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleAuthModalClose = () => {
    console.log('Closing auth modal from navigation');
    setAuthModalOpen(false);
  };

  return (
    <div className="w-full">
      <RoleBasedNavigation
        onLoginClick={handleLoginClick}
        language={language}
        onLanguageToggle={handleLanguageToggle}
        theme={theme || "light"}
        onThemeToggle={handleThemeToggle}
      />
      
      <SimpleAuthModal 
        isOpen={authModalOpen} 
        onClose={handleAuthModalClose}
      />
    </div>
  );
};

export default Navigation;
