import React, { useState } from 'react';
import { Menu, X, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import MobileFirstLayout from './MobileFirstLayout';
import ResponsiveGrid from './ResponsiveGrid';
import { cn } from '@/lib/utils';

/**
 * Mobile-First Demo Component
 * Demonstrates responsive design patterns with modern CSS
 */
const MobileFirstDemo: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
  };

  // Sample data for demonstration
  const sampleCards = [
    { id: 1, title: 'Modern Villa', price: '$850,000', location: 'Beverly Hills' },
    { id: 2, title: 'City Apartment', price: '$420,000', location: 'Downtown' },
    { id: 3, title: 'Beach House', price: '$1,200,000', location: 'Malibu' },
    { id: 4, title: 'Mountain Cabin', price: '$380,000', location: 'Aspen' },
    { id: 5, title: 'Urban Loft', price: '$650,000', location: 'SoHo' },
    { id: 6, title: 'Suburban Home', price: '$520,000', location: 'Westside' },
  ];

  return (
    <MobileFirstLayout>
      {/* Header with Navigation */}
      <header className="nav-mobile sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
            <span className="text-mobile-h3 font-bold hide-mobile">
              PropertyApp
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hide-mobile flex items-center gap-6">
            <a href="#" className="nav-link">Home</a>
            <a href="#" className="nav-link">Properties</a>
            <a href="#" className="nav-link">About</a>
            <a href="#" className="nav-link">Contact</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="touch-target p-2 rounded-lg bg-muted hover:bg-muted/80"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="menu-toggle-mobile show-mobile"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <nav className="show-mobile mt-4 pt-4 border-t border-border">
            <div className="flex flex-col gap-2">
              <a href="#" className="touch-target text-left">Home</a>
              <a href="#" className="touch-target text-left">Properties</a>
              <a href="#" className="touch-target text-left">About</a>
              <a href="#" className="touch-target text-left">Contact</a>
            </div>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-8 md:py-12 lg:py-16 text-center">
        <h1 className="text-mobile-h1 gradient-text mb-4">
          Find Your Dream Property
        </h1>
        <p className="text-mobile-body text-muted-foreground max-w-2xl mx-auto mb-8">
          Discover amazing properties with our mobile-first, responsive design. 
          Optimized for all devices with modern CSS Grid and Flexbox.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-mobile max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-mobile"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </section>

      {/* Features Section */}
      <section className="py-8">
        <h2 className="text-mobile-h2 text-center mb-8">
          Responsive Features
        </h2>
        
        <ResponsiveGrid 
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap="medium"
        >
          <div className="card-mobile">
            <h3 className="text-mobile-h3 mb-3">Mobile-First Design</h3>
            <p className="text-mobile-body text-muted-foreground">
              Built with mobile users in mind, ensuring optimal experience on all devices.
            </p>
          </div>
          
          <div className="card-mobile">
            <h3 className="text-mobile-h3 mb-3">Touch-Friendly UI</h3>
            <p className="text-mobile-body text-muted-foreground">
              44px minimum touch targets following Apple's accessibility guidelines.
            </p>
          </div>
          
          <div className="card-mobile">
            <h3 className="text-mobile-h3 mb-3">Fast & Lightweight</h3>
            <p className="text-mobile-body text-muted-foreground">
              Optimized CSS and minimal JavaScript for fast loading times.
            </p>
          </div>
          
          <div className="card-mobile">
            <h3 className="text-mobile-h3 mb-3">Modern CSS Grid</h3>
            <p className="text-mobile-body text-muted-foreground">
              Flexible layouts using CSS Grid and Flexbox for complex designs.
            </p>
          </div>
          
          <div className="card-mobile">
            <h3 className="text-mobile-h3 mb-3">Dark Mode Ready</h3>
            <p className="text-mobile-body text-muted-foreground">
              Seamless theme switching with CSS custom properties.
            </p>
          </div>
          
          <div className="card-mobile">
            <h3 className="text-mobile-h3 mb-3">3D Model Support</h3>
            <p className="text-mobile-body text-muted-foreground">
              Responsive canvas containers for Three.js and other 3D libraries.
            </p>
          </div>
        </ResponsiveGrid>
      </section>

      {/* Properties Grid */}
      <section className="py-8">
        <h2 className="text-mobile-h2 text-center mb-8">
          Sample Properties
        </h2>
        
        <div className="property-grid-mobile">
          {sampleCards.map((property) => (
            <div key={property.id} className="card-mobile group cursor-pointer">
              {/* Property Image Placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 transition-transform group-hover:scale-105">
                <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                  Property Image
                </div>
              </div>
              
              <h3 className="text-mobile-h3 mb-2">{property.title}</h3>
              <p className="text-lg font-bold text-primary mb-1">{property.price}</p>
              <p className="text-mobile-small text-muted-foreground mb-4">{property.location}</p>
              
              <div className="flex flex-mobile-row gap-2">
                <button className="btn-mobile flex-1">View Details</button>
                <button className="btn-mobile-secondary">Save</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3D Model Demo Section */}
      <section className="py-8">
        <h2 className="text-mobile-h2 text-center mb-8">
          3D Model Container
        </h2>
        
        <div className="model-container-mobile">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 animate-pulse"></div>
              <p className="text-mobile-body text-muted-foreground">
                3D Model would render here
              </p>
              <p className="text-mobile-small text-muted-foreground mt-2">
                Canvas automatically scales to container
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-mobile border-t border-border mt-16">
        <div>
          <p className="text-mobile-small text-muted-foreground">
            © 2024 PropertyApp. Mobile-first responsive design.
          </p>
        </div>
        <div className="flex gap-4">
          <a href="#" className="text-mobile-small text-muted-foreground hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="text-mobile-small text-muted-foreground hover:text-foreground">
            Terms
          </a>
          <a href="#" className="text-mobile-small text-muted-foreground hover:text-foreground">
            Support
          </a>
        </div>
      </footer>
    </MobileFirstLayout>
  );
};

export default MobileFirstDemo;