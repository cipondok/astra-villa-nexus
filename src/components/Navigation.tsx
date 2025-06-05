
import { Button } from "@/components/ui/button";
import { Sun, Moon, Globe, Menu } from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  onLoginClick: () => void;
  language: string;
  onLanguageToggle: () => void;
  theme: string;
  onThemeToggle: () => void;
}

const Navigation = ({ onLoginClick, language, onLanguageToggle, theme, onThemeToggle }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const text = {
    en: {
      buy: "Buy",
      rent: "Rent",
      newProjects: "New Projects",
      vendors: "Vendors",
      about: "About",
      login: "Login",
      register: "Register"
    },
    id: {
      buy: "Beli",
      rent: "Sewa",
      newProjects: "Proyek Baru",
      vendors: "Vendor",
      about: "Tentang",
      login: "Masuk",
      register: "Daftar"
    }
  };

  const currentText = text[language];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Astra Villa
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              {currentText.buy}
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              {currentText.rent}
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              {currentText.newProjects}
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              {currentText.vendors}
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              {currentText.about}
            </a>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLanguageToggle}
              className="hidden sm:flex items-center space-x-1"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="hidden sm:flex"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" onClick={onLoginClick}>
                {currentText.login}
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                onClick={onLoginClick}
              >
                {currentText.register}
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                {currentText.buy}
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                {currentText.rent}
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                {currentText.newProjects}
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                {currentText.vendors}
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                {currentText.about}
              </a>
              <div className="px-3 py-2 space-y-2">
                <Button variant="ghost" onClick={onLoginClick} className="w-full justify-start">
                  {currentText.login}
                </Button>
                <Button onClick={onLoginClick} className="w-full bg-gradient-to-r from-blue-600 to-orange-500">
                  {currentText.register}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
