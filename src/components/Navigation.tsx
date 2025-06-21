
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages } from '@/config/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from './ModeToggle';
import EnhancedWalletButton from './wallet/EnhancedWalletButton';

const Navigation = () => {
  const { user, isAuthenticated, signOut, profile } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'en' | 'id');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <Link to="/">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="ASTRA Villa Realty"
                />
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:text-gray-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Home
              </Link>
              <Link to="/properties" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:text-gray-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Properties
              </Link>
              <Link to="/about" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:text-gray-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                About
              </Link>
              <Link to="/help" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:text-gray-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Help
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:text-gray-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {languages[language].name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {Object.entries(languages).map(([key, value]) => (
                  <DropdownMenuItem key={key} onClick={() => handleLanguageChange(key)}>
                    {value.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher */}
            <ModeToggle />
            
            {/* Enhanced Wallet Button */}
            <EnhancedWalletButton />

            {/* Authentication Links */}
            {!isAuthenticated ? (
              <Link to="/?auth=true" className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-500 text-sm font-medium">
                Sign In
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || `https://avatar.vercel.sh/${user?.email}.png`} alt={user?.email} />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link to="/dashboard" className="w-full h-full block">Dashboard</Link>
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem>
                      <Link to="/dashboard/admin" className="w-full h-full block">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link to="/" className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium">
            Home
          </Link>
          <Link to="/properties" className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium">
            Properties
          </Link>
          <Link to="/about" className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium">
            About
          </Link>
          <Link to="/help" className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium">
            Help
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium">
              Dashboard
            </Link>
          )}
          {!isAuthenticated ? (
            <Link to="/?auth=true" className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-500 block px-3 py-2 rounded-md text-base font-medium">
              Sign In
            </Link>
          ) : (
            <button onClick={signOut} className="text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-red-300 dark:hover:text-red-500 block px-3 py-2 rounded-md text-base font-medium">
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
