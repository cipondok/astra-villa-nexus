import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Search, MessageSquare, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LanguageToggleSwitch from "./LanguageToggleSwitch";
import ThemeToggleSwitch from "./ThemeToggleSwitch";
import EnhancedAuthModal from "./auth/EnhancedAuthModal";

const Navigation = () => {
  const { language } = useLanguage();
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navigationItems = [
    { href: "/", label: text[language].home },
    { href: "/properties", label: text[language].properties },
    { href: "/agents", label: text[language].agents },
    { href: "/about", label: text[language].about },
    { href: "/contact", label: text[language].contact },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const text = {
    en: {
      home: "Home",
      properties: "Properties",
      agents: "Agents",
      about: "About",
      contact: "Contact",
      signIn: "Sign In",
      signOut: "Sign Out",
      welcome: "Welcome",
      profile: "Profile",
      dashboard: "Dashboard",
      notifications: "Notifications",
      chat: "AI Chat"
    },
    id: {
      home: "Beranda",
      properties: "Properti",
      agents: "Agen",
      about: "Tentang",
      contact: "Kontak",
      signIn: "Masuk",
      signOut: "Keluar",
      welcome: "Selamat datang",
      profile: "Profil",
      dashboard: "Dasbor",
      notifications: "Notifikasi",
      chat: "AI Chat"
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Astra Villa
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigationItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Desktop Auth & Settings */}
            <div className="hidden md:flex items-center space-x-3">
              <LanguageToggleSwitch />
              <ThemeToggleSwitch />
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {text[language].welcome}, {profile?.full_name || user?.email?.split('@')[0]}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{text[language].signOut}</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                >
                  {text[language].signIn}
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {/* Mobile Navigation Items */}
                    {navigationItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-base font-medium transition-colors"
                      >
                        {item.label}
                      </a>
                    ))}
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <LanguageToggleSwitch />
                        <ThemeToggleSwitch />
                      </div>
                      
                      {isAuthenticated ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 px-3 py-2">
                            <User className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {text[language].welcome}, {profile?.full_name || user?.email?.split('@')[0]}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center space-x-2"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>{text[language].signOut}</span>
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setAuthModalOpen(true)}
                          className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                        >
                          {text[language].signIn}
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Auth Modal */}
      <EnhancedAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        language={language}
      />
    </>
  );
};

export default Navigation;
